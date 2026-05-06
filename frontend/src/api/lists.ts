import client from './client'
import type { TaskList, CreateListRequest, UpdateListRequest, UpdateListPositionRequest } from '../types/api'

export const createList = (data: CreateListRequest): Promise<TaskList> =>
  client.post<TaskList>('/lists', data).then(res => res.data)

export const updateList = (listId: string, data: UpdateListRequest): Promise<TaskList> =>
  client.put<TaskList>(`/lists/${listId}`, data).then(res => res.data)

export const updateListPosition = (listId: string, data: UpdateListPositionRequest): Promise<TaskList> =>
  client.patch<TaskList>(`/lists/${listId}/position`, data).then(res => res.data)

export const deleteList = (listId: string): Promise<void> =>
  client.delete(`/lists/${listId}`).then(() => undefined)
