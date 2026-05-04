package com.taskmanagement.app.checklist;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/checklists")
public class ChecklistController {

    private final ChecklistService checklistService;

    public ChecklistController(ChecklistService checklistService) {
        this.checklistService = checklistService;
    }

    @PostMapping
    public ResponseEntity<ChecklistResponse> createChecklist(@RequestBody @Valid ChecklistCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(checklistService.createChecklist(request));
    }

    @PostMapping("/{checklistId}/items")
    public ResponseEntity<ChecklistItemResponse> createChecklistItem(
            @PathVariable UUID checklistId,
            @RequestBody @Valid ChecklistItemCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(checklistService.createChecklistItem(checklistId, request));
    }
}
