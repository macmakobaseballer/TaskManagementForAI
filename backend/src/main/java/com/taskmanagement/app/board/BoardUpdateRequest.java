package com.taskmanagement.app.board;

import jakarta.validation.constraints.NotBlank;

public record BoardUpdateRequest(
    @NotBlank String title
) {}
