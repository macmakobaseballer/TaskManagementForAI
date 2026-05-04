package com.taskmanagement.app.board;

import com.taskmanagement.app.list.TaskListResponse;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record BoardDetailResponse(
    UUID id,
    String title,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<TaskListResponse> lists
) {}
