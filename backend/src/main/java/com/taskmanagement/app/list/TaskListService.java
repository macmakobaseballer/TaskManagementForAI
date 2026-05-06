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

    @Transactional
    public TaskListResponse updateList(UUID listId, TaskListUpdateRequest request) {
        TaskList list = taskListRepository.findById(listId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        list.setTitle(request.title().strip());
        list.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        TaskList saved = taskListRepository.save(list);
        return new TaskListResponse(saved.getId(), saved.getTitle(), saved.getPosition(), List.of());
    }

    @Transactional
    public TaskListResponse updateListPosition(UUID listId, TaskListPositionUpdateRequest request) {
        TaskList list = taskListRepository.findById(listId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        list.setPosition(calcPosition(request.prevPosition(), request.nextPosition()));
        list.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        TaskList saved = taskListRepository.save(list);
        return new TaskListResponse(saved.getId(), saved.getTitle(), saved.getPosition(), List.of());
    }

    @Transactional
    public void deleteList(UUID listId) {
        if (!taskListRepository.existsById(listId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found");
        taskListRepository.deleteById(listId);
    }

    private double calcPosition(Double prev, Double next) {
        if (prev == null && next == null) return 1024.0;
        if (prev == null) return next / 2.0;
        if (next == null) return prev + 1024;
        return (prev + next) / 2.0;
    }
}
