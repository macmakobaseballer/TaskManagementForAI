import client from './client'
import type { BoardSummary, BoardDetail, CreateBoardRequest, UpdateBoardRequest } from '../types/api'

export const fetchBoards = (): Promise<BoardSummary[]> =>
  client.get<BoardSummary[]>('/boards').then(res => res.data)

export const fetchBoardDetail = (boardId: string): Promise<BoardDetail> =>
  client.get<BoardDetail>(`/boards/${boardId}`).then(res => res.data)

export const createBoard = (data: CreateBoardRequest): Promise<BoardSummary> =>
  client.post<BoardSummary>('/boards', data).then(res => res.data)

export const updateBoard = (boardId: string, data: UpdateBoardRequest): Promise<BoardSummary> =>
  client.put<BoardSummary>(`/boards/${boardId}`, data).then(res => res.data)
