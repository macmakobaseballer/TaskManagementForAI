package com.taskmanagement.app.list;

public record TaskListPositionUpdateRequest(
    Double prevPosition,
    Double nextPosition
) {}
