package com.taskmanagement.app.checklist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ChecklistCreateRequest(
    @NotBlank String title,
    @NotNull UUID cardId
) {}
