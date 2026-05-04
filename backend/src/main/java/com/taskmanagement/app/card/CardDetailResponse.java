package com.taskmanagement.app.card;

import com.taskmanagement.app.checklist.ChecklistResponse;
import com.taskmanagement.app.label.LabelResponse;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record CardDetailResponse(
    UUID id,
    UUID listId,
    String title,
    String description,
    String priority,
    LocalDate dueDate,
    double position,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<LabelResponse> labels,
    List<ChecklistResponse> checklists
) {}
