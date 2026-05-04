package com.taskmanagement.app.card;

import com.taskmanagement.app.label.LabelResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CardSummaryResponse(
    UUID id,
    String title,
    String description,
    String priority,
    LocalDate dueDate,
    double position,
    List<LabelResponse> labels
) {}
