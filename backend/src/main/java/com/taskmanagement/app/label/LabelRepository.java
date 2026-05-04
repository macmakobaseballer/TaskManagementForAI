package com.taskmanagement.app.label;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LabelRepository extends JpaRepository<Label, UUID> {

    List<Label> findByBoardIdOrderByCreatedAtAsc(UUID boardId);
}
