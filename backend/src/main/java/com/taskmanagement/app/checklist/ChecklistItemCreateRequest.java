package com.taskmanagement.app.checklist;

import jakarta.validation.constraints.NotBlank;

public record ChecklistItemCreateRequest(
    @NotBlank String text
) {}
