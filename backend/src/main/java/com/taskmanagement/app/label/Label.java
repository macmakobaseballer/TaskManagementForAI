package com.taskmanagement.app.label;

import com.taskmanagement.app.board.Board;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "labels")
public class Label {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "color", nullable = false)
    private String color;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Label() {}

    Label(UUID id, Board board, String name, String color, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.board = board;
        this.name = name;
        this.color = color;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public Board getBoard() { return board; }
    public String getName() { return name; }
    public String getColor() { return color; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    void setName(String name) { this.name = name; }
    void setColor(String color) { this.color = color; }
    void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
