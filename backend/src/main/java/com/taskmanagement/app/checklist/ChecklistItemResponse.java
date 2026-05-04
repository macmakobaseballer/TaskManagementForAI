package com.taskmanagement.app.checklist;

import java.util.UUID;

public record ChecklistItemResponse(
    UUID id,
    String text,
    boolean isCompleted,
    double position
) {
    public static ChecklistItemResponse from(ChecklistItem item) {
        return new ChecklistItemResponse(
            item.getId(),
            item.getText(),
            item.getIsCompleted(),
            item.getPosition()
        );
    }
}
