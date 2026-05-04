package com.taskmanagement.app.list;

import com.taskmanagement.app.board.Board;
import com.taskmanagement.app.card.Card;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "lists")
public class TaskList {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "position", nullable = false)
    private Double position;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "taskList", fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<Card> cards = new ArrayList<>();

    public UUID getId() { return id; }
    public Board getBoard() { return board; }
    public String getTitle() { return title; }
    public Double getPosition() { return position; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public List<Card> getCards() { return cards; }
}
