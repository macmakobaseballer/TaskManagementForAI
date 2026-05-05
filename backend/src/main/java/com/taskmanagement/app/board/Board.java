package com.taskmanagement.app.board;

import com.taskmanagement.app.list.TaskList;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "boards")
public class Board {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @OneToMany(mappedBy = "board", fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<TaskList> lists = new ArrayList<>();

    protected Board() {}

    Board(UUID id, String title, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public List<TaskList> getLists() { return lists; }

    void setTitle(String title) { this.title = title; }
    void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }
}
