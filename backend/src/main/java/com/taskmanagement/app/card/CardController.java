package com.taskmanagement.app.card;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping
    public ResponseEntity<CardDetailResponse> createCard(@RequestBody @Valid CardCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cardService.createCard(request));
    }

    @GetMapping("/{cardId}")
    public ResponseEntity<CardDetailResponse> getCardDetail(@PathVariable UUID cardId) {
        return ResponseEntity.ok(cardService.getCardDetail(cardId));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<CardDetailResponse> updateCard(
            @PathVariable UUID cardId,
            @RequestBody @Valid CardUpdateRequest request) {
        return ResponseEntity.ok(cardService.updateCard(cardId, request));
    }

    @PatchMapping("/{cardId}/position")
    public ResponseEntity<CardDetailResponse> updateCardPosition(
            @PathVariable UUID cardId,
            @RequestBody CardPositionUpdateRequest request) {
        return ResponseEntity.ok(cardService.updateCardPosition(cardId, request));
    }

    @PostMapping("/{cardId}/labels/{labelId}")
    public ResponseEntity<CardDetailResponse> addLabelToCard(
            @PathVariable UUID cardId,
            @PathVariable UUID labelId) {
        return ResponseEntity.ok(cardService.addLabelToCard(cardId, labelId));
    }

    @DeleteMapping("/{cardId}/labels/{labelId}")
    public ResponseEntity<CardDetailResponse> removeLabelFromCard(
            @PathVariable UUID cardId,
            @PathVariable UUID labelId) {
        return ResponseEntity.ok(cardService.removeLabelFromCard(cardId, labelId));
    }
}
