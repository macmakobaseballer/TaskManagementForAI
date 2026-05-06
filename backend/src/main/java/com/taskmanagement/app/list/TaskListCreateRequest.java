package com.taskmanagement.app.list;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TaskListCreateRequest(
    @NotBlank String title,
    @NotNull UUID boardId
) {}
