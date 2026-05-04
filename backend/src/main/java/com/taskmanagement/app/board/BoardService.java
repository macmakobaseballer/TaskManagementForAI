package com.taskmanagement.app.board;

import com.taskmanagement.app.card.Card;
import com.taskmanagement.app.card.CardRepository;
import com.taskmanagement.app.card.CardSummaryResponse;
import com.taskmanagement.app.label.LabelResponse;
import com.taskmanagement.app.list.TaskListResponse;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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

    public List<BoardSummaryResponse> getAllBoards() {
        return boardRepository.findAll(Sort.by("createdAt"))
            .stream()
            .map(BoardSummaryResponse::from)
            .toList();
    }

    public BoardDetailResponse getBoardDetail(UUID boardId) {
        Board board = boardRepository.findBoardWithListsAndCards(boardId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        List<UUID> cardIds = board.getLists().stream()
            .flatMap(list -> list.getCards().stream())
            .map(Card::getId)
            .toList();

        Map<UUID, List<LabelResponse>> labelsByCardId;
        if (cardIds.isEmpty()) {
            labelsByCardId = Map.of();
        } else {
            labelsByCardId = cardRepository.findCardsWithLabels(cardIds)
                .stream()
                .collect(Collectors.toMap(
                    Card::getId,
                    c -> c.getLabels().stream().map(LabelResponse::from).toList()
                ));
        }

        final Map<UUID, List<LabelResponse>> labelsMap = labelsByCardId;

        List<TaskListResponse> listResponses = board.getLists().stream()
            .map(taskList -> {
                List<CardSummaryResponse> cardResponses = taskList.getCards().stream()
                    .map(card -> new CardSummaryResponse(
                        card.getId(),
                        card.getTitle(),
                        card.getDescription(),
                        card.getPriority().name().toLowerCase(),
                        card.getDueDate(),
                        card.getPosition(),
                        labelsMap.getOrDefault(card.getId(), List.of())
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
