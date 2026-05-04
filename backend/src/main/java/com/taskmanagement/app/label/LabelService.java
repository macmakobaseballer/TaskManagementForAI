package com.taskmanagement.app.label;

import com.taskmanagement.app.board.Board;
import com.taskmanagement.app.board.BoardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class LabelService {

    private final LabelRepository labelRepository;
    private final BoardRepository boardRepository;

    public LabelService(LabelRepository labelRepository, BoardRepository boardRepository) {
        this.labelRepository = labelRepository;
        this.boardRepository = boardRepository;
    }

    public List<LabelResponse> getLabelsByBoard(UUID boardId) {
        return labelRepository.findByBoardIdOrderByCreatedAtAsc(boardId)
            .stream()
            .map(LabelResponse::from)
            .toList();
    }

    @Transactional
    public LabelResponse createLabel(LabelCreateRequest request) {
        Board board = boardRepository.findById(request.boardId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        Label label = new Label(UUID.randomUUID(), board, request.name().strip(), request.color(), now, now);
        return LabelResponse.from(labelRepository.save(label));
    }
}
