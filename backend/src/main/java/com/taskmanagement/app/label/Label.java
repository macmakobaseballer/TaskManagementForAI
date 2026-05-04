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

    public UUID getId() { return id; }
    public Board getBoard() { return board; }
    public String getName() { return name; }
    public String getColor() { return color; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
