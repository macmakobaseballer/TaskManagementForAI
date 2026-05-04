package com.taskmanagement.app.card;

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

    @GetMapping("/{cardId}")
    public ResponseEntity<CardDetailResponse> getCardDetail(@PathVariable UUID cardId) {
        return ResponseEntity.ok(cardService.getCardDetail(cardId));
    }
}
