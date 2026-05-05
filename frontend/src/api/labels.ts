import client from './client'
import type { Label, CreateLabelRequest, UpdateLabelRequest } from '../types/api'

export const fetchLabelsByBoard = (boardId: string): Promise<Label[]> =>
  client.get<Label[]>(`/labels/board/${boardId}`).then(res => res.data)

export const createLabel = (data: CreateLabelRequest): Promise<Label> =>
  client.post<Label>('/labels', data).then(res => res.data)

export const updateLabel = (labelId: string, data: UpdateLabelRequest): Promise<Label> =>
  client.put<Label>(`/labels/${labelId}`, data).then(res => res.data)

export const deleteLabel = (labelId: string): Promise<void> =>
  client.delete(`/labels/${labelId}`).then(() => undefined)
