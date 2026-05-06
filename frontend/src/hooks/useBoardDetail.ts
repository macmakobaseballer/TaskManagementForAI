import { useState, useEffect, useCallback } from 'react'
import { fetchBoardDetail } from '../api/boards'
import type { BoardDetail } from '../types/api'

export function useBoardDetail(boardId: string) {
  const [board, setBoard] = useState<BoardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNotFound, setIsNotFound] = useState(false)

  // boardId が変化したら前のボードデータをクリアしローディングをリセット（render during render パターン）
  const [prevBoardId, setPrevBoardId] = useState(boardId)
  if (prevBoardId !== boardId) {
    setPrevBoardId(boardId)
    setBoard(null)
    setIsNotFound(false)
    setLoading(true)
  }

  const fetchData = useCallback(() => {
    if (!boardId) return
    fetchBoardDetail(boardId)
      .then(data => { setBoard(data); setIsNotFound(false); setLoading(false) })
      .catch(err => {
        if (err.response?.status === 404) {
          setIsNotFound(true)
        } else {
          setError(err.message ?? 'ボード詳細の取得に失敗しました')
        }
        setLoading(false)
      })
  }, [boardId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  return { board, loading, error, isNotFound, refetch }
}
