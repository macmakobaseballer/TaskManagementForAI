import { useState, useEffect } from 'react'
import { fetchBoards } from '../api/boards'
import type { BoardSummary } from '../types/api'

export function useBoards() {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBoards()
      .then(setBoards)
      .catch(err => setError(err.message ?? 'ボードの取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [])

  return { boards, loading, error }
}
