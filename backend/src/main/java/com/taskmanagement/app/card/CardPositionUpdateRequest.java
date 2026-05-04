package com.taskmanagement.app.card;

import java.util.UUID;

public record CardPositionUpdateRequest(
    UUID listId,
    Double prevPosition,
    Double nextPosition
) {}
