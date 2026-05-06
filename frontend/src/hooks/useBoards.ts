import { useState, useEffect, useCallback } from 'react'
import { fetchBoards } from '../api/boards'
import type { BoardSummary } from '../types/api'

export function useBoards() {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    fetchBoards()
      .then(data => { setBoards(data); setLoading(false) })
      .catch(err => { setError(err.message ?? 'ボードの取得に失敗しました'); setLoading(false) })
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const refetch = useCallback(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  return { boards, loading, error, refetch }
}
