package com.taskmanagement.app.card;

import com.taskmanagement.app.checklist.ChecklistRepository;
import com.taskmanagement.app.checklist.ChecklistResponse;
import com.taskmanagement.app.label.LabelResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CardService {

    private final CardRepository cardRepository;
    private final ChecklistRepository checklistRepository;

    public CardService(CardRepository cardRepository, ChecklistRepository checklistRepository) {
        this.cardRepository = cardRepository;
        this.checklistRepository = checklistRepository;
    }

    public CardDetailResponse getCardDetail(UUID cardId) {
        Card card = cardRepository.findCardWithLabels(cardId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        List<LabelResponse> labels = card.getLabels().stream()
            .map(LabelResponse::from)
            .toList();

        List<ChecklistResponse> checklists = checklistRepository.findByCardIdWithItems(cardId)
            .stream()
            .map(ChecklistResponse::from)
            .toList();

        return new CardDetailResponse(
            card.getId(),
            card.getListId(),
            card.getTitle(),
            card.getDescription(),
            card.getPriority().name().toLowerCase(),
            card.getDueDate(),
            card.getPosition(),
            card.getCreatedAt(),
            card.getUpdatedAt(),
            labels,
            checklists
        );
    }
}
