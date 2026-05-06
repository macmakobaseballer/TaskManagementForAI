import client from './client'
import type {
  Checklist, ChecklistItem,
  CreateChecklistRequest, CreateChecklistItemRequest,
  UpdateChecklistRequest, UpdateChecklistItemRequest
} from '../types/api'

export const createChecklist = (data: CreateChecklistRequest): Promise<Checklist> =>
  client.post<Checklist>('/checklists', data).then(res => res.data)

export const createChecklistItem = (checklistId: string, data: CreateChecklistItemRequest): Promise<ChecklistItem> =>
  client.post<ChecklistItem>(`/checklists/${checklistId}/items`, data).then(res => res.data)

export const updateChecklist = (checklistId: string, data: UpdateChecklistRequest): Promise<Checklist> =>
  client.put<Checklist>(`/checklists/${checklistId}`, data).then(res => res.data)

export const updateChecklistItem = (itemId: string, data: UpdateChecklistItemRequest): Promise<ChecklistItem> =>
  client.put<ChecklistItem>(`/checklists/items/${itemId}`, data).then(res => res.data)

export const toggleChecklistItem = (itemId: string): Promise<ChecklistItem> =>
  client.patch<ChecklistItem>(`/checklists/items/${itemId}/toggle`).then(res => res.data)

export const deleteChecklist = (checklistId: string): Promise<void> =>
  client.delete(`/checklists/${checklistId}`).then(() => undefined)

export const deleteChecklistItem = (itemId: string): Promise<void> =>
  client.delete(`/checklists/items/${itemId}`).then(() => undefined)
