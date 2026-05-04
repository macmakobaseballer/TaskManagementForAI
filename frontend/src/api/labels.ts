import client from './client'
import type { Label, CreateLabelRequest } from '../types/api'

export const fetchLabelsByBoard = (boardId: string): Promise<Label[]> =>
  client.get<Label[]>(`/labels/board/${boardId}`).then(res => res.data)

export const createLabel = (data: CreateLabelRequest): Promise<Label> =>
  client.post<Label>('/labels', data).then(res => res.data)
