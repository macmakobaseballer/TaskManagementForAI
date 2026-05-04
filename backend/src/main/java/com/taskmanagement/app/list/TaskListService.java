package com.taskmanagement.app.list;

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
public class TaskListService {

    private final TaskListRepository taskListRepository;
    private final BoardRepository boardRepository;

    public TaskListService(TaskListRepository taskListRepository, BoardRepository boardRepository) {
        this.taskListRepository = taskListRepository;
        this.boardRepository = boardRepository;
    }

    @Transactional
    public TaskListResponse createList(TaskListCreateRequest request) {
        Board board = boardRepository.findById(request.boardId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        double newPosition = taskListRepository
            .findMaxPositionByBoardId(request.boardId())
            .orElse(0.0) + 1024;

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        TaskList list = new TaskList(UUID.randomUUID(), board, request.title().strip(), newPosition, now, now);
        TaskList saved = taskListRepository.save(list);

        return new TaskListResponse(saved.getId(), saved.getTitle(), saved.getPosition(), List.of());
    }
}
