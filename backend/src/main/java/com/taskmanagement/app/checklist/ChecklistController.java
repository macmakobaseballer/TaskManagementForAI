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

    @PutMapping("/{checklistId}")
    public ResponseEntity<ChecklistResponse> updateChecklist(
            @PathVariable UUID checklistId,
            @RequestBody @Valid ChecklistUpdateRequest request) {
        return ResponseEntity.ok(checklistService.updateChecklist(checklistId, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ChecklistItemResponse> updateChecklistItem(
            @PathVariable UUID itemId,
            @RequestBody @Valid ChecklistItemUpdateRequest request) {
        return ResponseEntity.ok(checklistService.updateChecklistItem(itemId, request));
    }

    @PatchMapping("/items/{itemId}/toggle")
    public ResponseEntity<ChecklistItemResponse> toggleChecklistItem(@PathVariable UUID itemId) {
        return ResponseEntity.ok(checklistService.toggleChecklistItem(itemId));
    }
}
