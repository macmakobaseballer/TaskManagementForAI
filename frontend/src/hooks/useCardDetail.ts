import { useState, useEffect, useCallback } from 'react'
import { fetchCardDetail } from '../api/cards'
import type { CardDetail } from '../types/api'

export function useCardDetail(cardId: string | null) {
  const [card, setCard] = useState<CardDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    if (!cardId) { setCard(null); return }
    setLoading(true)
    fetchCardDetail(cardId)
      .then(setCard)
      .catch(err => setError(err.message ?? 'カードの取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [cardId])

  useEffect(() => { fetchData() }, [fetchData])

  return { card, loading, error, refetch: fetchData }
}
