import client from './client'
import type { BoardSummary, BoardDetail } from '../types/api'

export const fetchBoards = (): Promise<BoardSummary[]> =>
  client.get<BoardSummary[]>('/boards').then(res => res.data)

export const fetchBoardDetail = (boardId: string): Promise<BoardDetail> =>
  client.get<BoardDetail>(`/boards/${boardId}`).then(res => res.data)
