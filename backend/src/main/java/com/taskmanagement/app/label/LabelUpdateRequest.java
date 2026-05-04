package com.taskmanagement.app.label;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LabelUpdateRequest(
    @NotBlank String name,
    @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color (#RRGGBB)") String color
) {}
