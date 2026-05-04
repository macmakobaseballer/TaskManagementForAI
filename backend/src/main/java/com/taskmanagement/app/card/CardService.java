package com.taskmanagement.app.card;

import com.taskmanagement.app.checklist.ChecklistRepository;
import com.taskmanagement.app.checklist.ChecklistResponse;
import com.taskmanagement.app.label.Label;
import com.taskmanagement.app.label.LabelRepository;
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
    private final LabelRepository labelRepository;

    public CardService(CardRepository cardRepository, ChecklistRepository checklistRepository,
                       TaskListRepository taskListRepository, LabelRepository labelRepository) {
        this.cardRepository = cardRepository;
        this.checklistRepository = checklistRepository;
        this.taskListRepository = taskListRepository;
        this.labelRepository = labelRepository;
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

    @Transactional
    public CardDetailResponse updateCard(UUID cardId, CardUpdateRequest request) {
        Card card = cardRepository.findCardWithLabels(cardId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        Priority priority = (request.priority() == null || request.priority().isBlank())
            ? card.getPriority()
            : Priority.valueOf(request.priority().toUpperCase());

        card.setTitle(request.title().strip());
        card.setDescription(request.description());
        card.setPriority(priority);
        card.setDueDate(request.dueDate());
        card.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        return toDetailResponse(cardRepository.save(card));
    }

    @Transactional
    public CardDetailResponse updateCardPosition(UUID cardId, CardPositionUpdateRequest request) {
        Card card = cardRepository.findCardWithLabels(cardId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (request.listId() != null && !request.listId().equals(card.getListId())) {
            TaskList newList = taskListRepository.findById(request.listId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
            card.setTaskList(newList);
        }
        card.setPosition(calcPosition(request.prevPosition(), request.nextPosition()));
        card.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        return toDetailResponse(cardRepository.save(card));
    }

    @Transactional
    public CardDetailResponse addLabelToCard(UUID cardId, UUID labelId) {
        Card card = cardRepository.findCardWithLabels(cardId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Label label = labelRepository.findById(labelId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Label not found"));

        boolean alreadyAttached = card.getLabels().stream().anyMatch(l -> l.getId().equals(labelId));
        if (!alreadyAttached) {
            card.getLabels().add(label);
            card.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
            cardRepository.save(card);
        }
        return toDetailResponse(card);
    }

    @Transactional
    public CardDetailResponse removeLabelFromCard(UUID cardId, UUID labelId) {
        Card card = cardRepository.findCardWithLabels(cardId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        card.getLabels().removeIf(l -> l.getId().equals(labelId));
        card.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        cardRepository.save(card);
        return toDetailResponse(card);
    }

    private CardDetailResponse toDetailResponse(Card card) {
        List<LabelResponse> labels = card.getLabels().stream()
            .map(LabelResponse::from)
            .toList();
        List<ChecklistResponse> checklists = checklistRepository.findByCardIdWithItems(card.getId())
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

    private double calcPosition(Double prev, Double next) {
        if (prev == null && next == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prevPosition or nextPosition required");
        if (prev == null) return next / 2.0;
        if (next == null) return prev + 1024;
        return (prev + next) / 2.0;
    }
}
