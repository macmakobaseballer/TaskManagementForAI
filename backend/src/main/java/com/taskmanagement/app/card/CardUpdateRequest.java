package com.taskmanagement.app.card;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CardUpdateRequest(
    @NotBlank String title,
    String description,
    String priority,
    LocalDate dueDate
) {}
