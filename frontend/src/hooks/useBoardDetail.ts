import { useState, useEffect } from 'react'
import { fetchBoardDetail } from '../api/boards'
import type { BoardDetail } from '../types/api'

export function useBoardDetail(boardId: string) {
  const [board, setBoard] = useState<BoardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!boardId) return
    setLoading(true)
    setBoard(null)
    fetchBoardDetail(boardId)
      .then(setBoard)
      .catch(err => setError(err.message ?? 'ボード詳細の取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [boardId])

  return { board, loading, error }
}
