package com.taskmanagement.app.checklist;

import jakarta.validation.constraints.NotBlank;

public record ChecklistUpdateRequest(
    @NotBlank String title
) {}
