package com.taskmanagement.app.card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CardCreateRequest(
    @NotBlank String title,
    @NotNull UUID listId,
    String priority,
    LocalDate dueDate
) {}
