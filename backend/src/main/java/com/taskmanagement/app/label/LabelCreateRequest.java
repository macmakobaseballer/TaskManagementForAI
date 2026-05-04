package com.taskmanagement.app.label;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record LabelCreateRequest(
    @NotBlank String name,
    @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color (#RRGGBB)") String color,
    @NotNull UUID boardId
) {}
