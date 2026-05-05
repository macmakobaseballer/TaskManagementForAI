package com.taskmanagement.app.list;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lists")
public class TaskListController {

    private final TaskListService taskListService;

    public TaskListController(TaskListService taskListService) {
        this.taskListService = taskListService;
    }

    @PostMapping
    public ResponseEntity<TaskListResponse> createList(@RequestBody @Valid TaskListCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskListService.createList(request));
    }

    @PutMapping("/{listId}")
    public ResponseEntity<TaskListResponse> updateList(
            @PathVariable UUID listId,
            @RequestBody @Valid TaskListUpdateRequest request) {
        return ResponseEntity.ok(taskListService.updateList(listId, request));
    }

    @PatchMapping("/{listId}/position")
    public ResponseEntity<TaskListResponse> updateListPosition(
            @PathVariable UUID listId,
            @RequestBody TaskListPositionUpdateRequest request) {
        return ResponseEntity.ok(taskListService.updateListPosition(listId, request));
    }
}
