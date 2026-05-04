package com.taskmanagement.app.checklist;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, UUID> {
}
