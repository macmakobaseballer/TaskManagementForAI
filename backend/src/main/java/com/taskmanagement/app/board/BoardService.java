package com.taskmanagement.app.board;

import com.taskmanagement.app.card.Card;
import com.taskmanagement.app.card.CardRepository;
import com.taskmanagement.app.card.CardSummaryResponse;
import com.taskmanagement.app.label.LabelResponse;
import com.taskmanagement.app.list.TaskList;
import com.taskmanagement.app.list.TaskListResponse;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;

    public BoardService(BoardRepository boardRepository, CardRepository cardRepository) {
        this.boardRepository = boardRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional
    public BoardSummaryResponse createBoard(BoardCreateRequest request) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        Board board = new Board(UUID.randomUUID(), request.title().strip(), now, now);
        return BoardSummaryResponse.from(boardRepository.save(board));
    }

    public List<BoardSummaryResponse> getAllBoards() {
        return boardRepository.findAll(Sort.by("createdAt"))
            .stream()
            .map(BoardSummaryResponse::from)
            .toList();
    }

    public BoardDetailResponse getBoardDetail(UUID boardId) {
        // Q1: board + lists（cards は MultipleBagFetchException 回避のため別クエリ）
        Board board = boardRepository.findBoardWithLists(boardId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        List<UUID> listIds = board.getLists().stream()
            .map(taskList -> taskList.getId())
            .toList();

        // Q2: 全リストのカード＋ラベルを一括取得し、listId でグループ化
        Map<UUID, List<Card>> cardsByListId;
        if (listIds.isEmpty()) {
            cardsByListId = Map.of();
        } else {
            cardsByListId = cardRepository.findCardsWithLabelsByListIds(listIds)
                .stream()
                .collect(Collectors.groupingBy(Card::getListId));
        }

        List<TaskListResponse> listResponses = board.getLists().stream()
            .map(taskList -> {
                List<CardSummaryResponse> cardResponses = cardsByListId
                    .getOrDefault(taskList.getId(), List.of())
                    .stream()
                    .map(card -> new CardSummaryResponse(
                        card.getId(),
                        card.getTitle(),
                        card.getDescription(),
                        card.getPriority().name().toLowerCase(),
                        card.getDueDate(),
                        card.getPosition(),
                        card.getLabels().stream().map(LabelResponse::from).toList()
                    ))
                    .toList();
                return new TaskListResponse(
                    taskList.getId(),
                    taskList.getTitle(),
                    taskList.getPosition(),
                    cardResponses
                );
            })
            .toList();

        return new BoardDetailResponse(
            board.getId(),
            board.getTitle(),
            board.getCreatedAt(),
            board.getUpdatedAt(),
            listResponses
        );
    }
}
