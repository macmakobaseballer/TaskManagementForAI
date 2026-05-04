package com.taskmanagement.app.list;

import com.taskmanagement.app.card.CardSummaryResponse;

import java.util.List;
import java.util.UUID;

public record TaskListResponse(
    UUID id,
    String title,
    double position,
    List<CardSummaryResponse> cards
) {}
