package com.taskmanagement.app.checklist;

import jakarta.validation.constraints.NotBlank;

public record ChecklistItemUpdateRequest(
    @NotBlank String text
) {}
