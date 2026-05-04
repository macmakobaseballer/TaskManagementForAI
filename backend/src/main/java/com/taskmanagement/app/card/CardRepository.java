package com.taskmanagement.app.card;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {

    @Query("SELECT c FROM Card c LEFT JOIN FETCH c.labels WHERE c.id IN :cardIds")
    List<Card> findCardsWithLabels(@Param("cardIds") List<UUID> cardIds);

    @Query("SELECT c FROM Card c LEFT JOIN FETCH c.labels WHERE c.id = :cardId")
    Optional<Card> findCardWithLabels(@Param("cardId") UUID cardId);
}
