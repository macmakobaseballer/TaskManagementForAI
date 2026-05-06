package com.taskmanagement.app.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {

    @Query("SELECT b FROM Board b WHERE b.deletedAt IS NULL ORDER BY b.createdAt ASC")
    List<Board> findAllActive();

    @Query("SELECT b FROM Board b WHERE b.id = :boardId AND b.deletedAt IS NULL")
    Optional<Board> findActiveById(@Param("boardId") UUID boardId);

    // Board + lists のみ取得（MultipleBagFetchException 回避のため cards は別クエリ）
    @Query("""
        SELECT b FROM Board b
        LEFT JOIN FETCH b.lists l
        WHERE b.id = :boardId AND b.deletedAt IS NULL
        ORDER BY l.position ASC
        """)
    Optional<Board> findBoardWithLists(@Param("boardId") UUID boardId);
}
