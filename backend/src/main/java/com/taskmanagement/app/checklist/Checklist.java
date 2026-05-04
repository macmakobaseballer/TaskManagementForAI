package com.taskmanagement.app.checklist;

import com.taskmanagement.app.card.Card;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "checklists")
public class Checklist {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "position", nullable = false)
    private Double position;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "checklist", fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<ChecklistItem> items = new ArrayList<>();

    protected Checklist() {}

    Checklist(UUID id, Card card, String title, Double position, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.card = card;
        this.title = title;
        this.position = position;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public Card getCard() { return card; }
    public String getTitle() { return title; }
    public Double getPosition() { return position; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public List<ChecklistItem> getItems() { return items; }
}
