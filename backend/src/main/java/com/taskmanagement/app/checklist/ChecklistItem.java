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

    public UUID getId() { return id; }
    public Checklist getChecklist() { return checklist; }
    public String getText() { return text; }
    public Boolean getIsCompleted() { return isCompleted; }
    public Double getPosition() { return position; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
