package com.taskmanagement.app.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {

    // Board + lists のみ取得（MultipleBagFetchException 回避のため cards は別クエリ）
    @Query("""
        SELECT b FROM Board b
        LEFT JOIN FETCH b.lists l
        WHERE b.id = :boardId
        ORDER BY l.position ASC
        """)
    Optional<Board> findBoardWithLists(@Param("boardId") UUID boardId);
}
