import { useState, useEffect, useCallback } from 'react'
import { fetchCardDetail } from '../api/cards'
import type { CardDetail } from '../types/api'

export function useCardDetail(cardId: string | null) {
  const [card, setCard] = useState<CardDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // cardId が変化したらカードをクリアしてローディング状態をリセット（render during render パターン）
  const [prevCardId, setPrevCardId] = useState(cardId)
  if (prevCardId !== cardId) {
    setPrevCardId(cardId)
    setCard(null)
    setLoading(!!cardId)
  }

  const fetchData = useCallback((): Promise<void> => {
    if (!cardId) return Promise.resolve()
    return fetchCardDetail(cardId)
      .then(data => { setCard(data); setError(null); setLoading(false) })
      .catch(err => { setError(err.message ?? 'カードの取得に失敗しました'); setLoading(false) })
  }, [cardId])

  useEffect(() => { fetchData() }, [fetchData])

  return { card, loading, error, refetch: fetchData }
}
