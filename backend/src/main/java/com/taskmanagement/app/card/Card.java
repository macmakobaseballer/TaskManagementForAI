package com.taskmanagement.app.card;

import com.taskmanagement.app.checklist.Checklist;
import com.taskmanagement.app.label.Label;
import com.taskmanagement.app.list.TaskList;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cards")
public class Card {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "list_id", nullable = false, insertable = false, updatable = false)
    private UUID listId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private TaskList taskList;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "priority", nullable = false)
    private Priority priority;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "position", nullable = false)
    private Double position;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "card_labels",
        joinColumns = @JoinColumn(name = "card_id"),
        inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    private List<Label> labels = new ArrayList<>();

    @OneToMany(mappedBy = "card", fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<Checklist> checklists = new ArrayList<>();

    protected Card() {}

    Card(UUID id, TaskList taskList, String title, Priority priority, LocalDate dueDate,
         Double position, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.taskList = taskList;
        this.title = title;
        this.priority = priority;
        this.dueDate = dueDate;
        this.position = position;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public UUID getListId() { return listId; }
    public TaskList getTaskList() { return taskList; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Priority getPriority() { return priority; }
    public LocalDate getDueDate() { return dueDate; }
    public Double getPosition() { return position; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public List<Label> getLabels() { return labels; }
    public List<Checklist> getChecklists() { return checklists; }

    void setTitle(String title) { this.title = title; }
    void setDescription(String description) { this.description = description; }
    void setPriority(Priority priority) { this.priority = priority; }
    void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    void setTaskList(TaskList taskList) { this.taskList = taskList; }
    void setPosition(Double position) { this.position = position; }
    void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
