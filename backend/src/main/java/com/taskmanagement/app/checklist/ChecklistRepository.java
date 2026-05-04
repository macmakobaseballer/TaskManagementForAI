package com.taskmanagement.app.checklist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChecklistRepository extends JpaRepository<Checklist, UUID> {

    @Query("""
        SELECT cl FROM Checklist cl
        LEFT JOIN FETCH cl.items
        WHERE cl.card.id = :cardId
        ORDER BY cl.position ASC
        """)
    List<Checklist> findByCardIdWithItems(@Param("cardId") UUID cardId);

    @Query("SELECT MAX(cl.position) FROM Checklist cl WHERE cl.card.id = :cardId")
    Optional<Double> findMaxPositionByCardId(@Param("cardId") UUID cardId);
}
