package com.taskmanagement.app.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {

    @Query("""
        SELECT DISTINCT b FROM Board b
        LEFT JOIN FETCH b.lists l
        LEFT JOIN FETCH l.cards c
        WHERE b.id = :boardId
        ORDER BY l.position ASC, c.position ASC
        """)
    Optional<Board> findBoardWithListsAndCards(@Param("boardId") UUID boardId);
}
