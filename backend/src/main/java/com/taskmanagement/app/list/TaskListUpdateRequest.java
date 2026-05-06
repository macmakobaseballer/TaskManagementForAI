package com.taskmanagement.app.list;

import jakarta.validation.constraints.NotBlank;

public record TaskListUpdateRequest(
    @NotBlank String title
) {}
