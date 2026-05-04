package com.taskmanagement.app.checklist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, UUID> {

    @Query("SELECT MAX(ci.position) FROM ChecklistItem ci WHERE ci.checklist.id = :checklistId")
    Optional<Double> findMaxPositionByChecklistId(@Param("checklistId") UUID checklistId);
}
