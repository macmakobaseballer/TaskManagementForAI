package com.taskmanagement.app.list;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TaskListRepository extends JpaRepository<TaskList, UUID> {

    @Query("SELECT MAX(l.position) FROM TaskList l WHERE l.board.id = :boardId")
    Optional<Double> findMaxPositionByBoardId(@Param("boardId") UUID boardId);
}
