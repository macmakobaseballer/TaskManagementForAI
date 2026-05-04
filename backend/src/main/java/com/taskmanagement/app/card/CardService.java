package com.taskmanagement.app.card;

import com.taskmanagement.app.checklist.ChecklistRepository;
import com.taskmanagement.app.checklist.ChecklistResponse;
import com.taskmanagement.app.label.LabelResponse;
import com.taskmanagement.app.list.TaskList;
import com.taskmanagement.app.list.TaskListRepository;
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
public class CardService {

    private final CardRepository cardRepository;
    private final ChecklistRepository checklistRepository;
    private final TaskListRepository taskListRepository;

    public CardService(CardRepository cardRepository, ChecklistRepository checklistRepository,
                       TaskListRepository taskListRepository) {
        this.cardRepository = cardRepository;
        this.checklistRepository = checklistRepository;
        this.taskListRepository = taskListRepository;
    }

    @Transactional
    public CardDetailResponse createCard(CardCreateRequest request) {
        TaskList list = taskListRepository.findById(request.listId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));

        Priority priority = (request.priority() == null || request.priority().isBlank())
            ? Priority.MEDIUM
            : Priority.valueOf(request.priority().toUpperCase());

        double newPosition = cardRepository
            .findMaxPositionByListId(request.listId())
            .orElse(0.0) + 1024;

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        Card card = new Card(UUID.randomUUID(), list, request.title().strip(), priority,
            request.dueDate(), newPosition, now, now);
        Card saved = cardRepository.save(card);

        return new CardDetailResponse(
            saved.getId(),
            list.getId(),
            saved.getTitle(),
            saved.getDescription(),
            saved.getPriority().name().toLowerCase(),
            saved.getDueDate(),
            saved.getPosition(),
            saved.getCreatedAt(),
            saved.getUpdatedAt(),
            List.of(),
            List.of()
        );
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
