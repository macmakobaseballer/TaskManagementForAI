package com.taskmanagement.app.checklist;

import com.taskmanagement.app.card.Card;
import com.taskmanagement.app.card.CardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ChecklistService {

    private final ChecklistRepository checklistRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final CardRepository cardRepository;

    public ChecklistService(ChecklistRepository checklistRepository,
                            ChecklistItemRepository checklistItemRepository,
                            CardRepository cardRepository) {
        this.checklistRepository = checklistRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional
    public ChecklistResponse createChecklist(ChecklistCreateRequest request) {
        Card card = cardRepository.findById(request.cardId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        double newPosition = checklistRepository
            .findMaxPositionByCardId(request.cardId())
            .orElse(0.0) + 1024;

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        Checklist checklist = new Checklist(UUID.randomUUID(), card, request.title().strip(), newPosition, now, now);
        Checklist saved = checklistRepository.save(checklist);

        return new ChecklistResponse(saved.getId(), saved.getTitle(), saved.getPosition(), List.of());
    }

    @Transactional
    public ChecklistItemResponse createChecklistItem(UUID checklistId, ChecklistItemCreateRequest request) {
        Checklist checklist = checklistRepository.findById(checklistId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Checklist not found"));

        double newPosition = checklistItemRepository
            .findMaxPositionByChecklistId(checklistId)
            .orElse(0.0) + 1024;

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        ChecklistItem item = new ChecklistItem(
            UUID.randomUUID(), checklist, request.text().strip(), false, newPosition, now, now);
        return ChecklistItemResponse.from(checklistItemRepository.save(item));
    }
}
