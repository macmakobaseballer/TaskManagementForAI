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

    // ボード詳細用: 複数リストIDに属するカードをラベルと一括取得（position 順）
    @Query("""
        SELECT c FROM Card c
        LEFT JOIN FETCH c.labels
        WHERE c.listId IN :listIds
        ORDER BY c.listId ASC, c.position ASC
        """)
    List<Card> findCardsWithLabelsByListIds(@Param("listIds") List<UUID> listIds);

    @Query("SELECT c FROM Card c LEFT JOIN FETCH c.labels WHERE c.id = :cardId")
    Optional<Card> findCardWithLabels(@Param("cardId") UUID cardId);
}
