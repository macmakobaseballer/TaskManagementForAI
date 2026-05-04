package com.taskmanagement.app.label;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/labels")
public class LabelController {

    private final LabelService labelService;

    public LabelController(LabelService labelService) {
        this.labelService = labelService;
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<LabelResponse>> getLabelsByBoard(@PathVariable UUID boardId) {
        return ResponseEntity.ok(labelService.getLabelsByBoard(boardId));
    }

    @PostMapping
    public ResponseEntity<LabelResponse> createLabel(@RequestBody @Valid LabelCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(labelService.createLabel(request));
    }
}
