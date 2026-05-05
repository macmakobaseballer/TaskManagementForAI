package com.taskmanagement.app.checklist;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "checklist_items")
public class ChecklistItem {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false)
    private Checklist checklist;

    @Column(name = "text", nullable = false)
    private String text;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted;

    @Column(name = "position", nullable = false)
    private Double position;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected ChecklistItem() {}

    ChecklistItem(UUID id, Checklist checklist, String text, Boolean isCompleted,
                  Double position, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.checklist = checklist;
        this.text = text;
        this.isCompleted = isCompleted;
        this.position = position;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public Checklist getChecklist() { return checklist; }
    public String getText() { return text; }
    public Boolean getIsCompleted() { return isCompleted; }
    public Double getPosition() { return position; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    void setText(String text) { this.text = text; }
    void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }
    void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
