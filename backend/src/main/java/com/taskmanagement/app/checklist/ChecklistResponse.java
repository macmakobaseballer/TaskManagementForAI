package com.taskmanagement.app.checklist;

import java.util.List;
import java.util.UUID;

public record ChecklistResponse(
    UUID id,
    String title,
    double position,
    List<ChecklistItemResponse> items
) {
    public static ChecklistResponse from(Checklist checklist) {
        List<ChecklistItemResponse> items = checklist.getItems().stream()
            .map(ChecklistItemResponse::from)
            .toList();
        return new ChecklistResponse(
            checklist.getId(),
            checklist.getTitle(),
            checklist.getPosition(),
            items
        );
    }
}
