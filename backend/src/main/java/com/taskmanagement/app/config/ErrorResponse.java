package com.taskmanagement.app.config;

import java.time.OffsetDateTime;

public record ErrorResponse(int status, String message, OffsetDateTime timestamp) {}
