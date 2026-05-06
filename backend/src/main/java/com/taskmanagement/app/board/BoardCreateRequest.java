package com.taskmanagement.app.board;

import jakarta.validation.constraints.NotBlank;

public record BoardCreateRequest(
    @NotBlank String title
) {}
