import client from './client'
import type { Checklist, ChecklistItem, CreateChecklistRequest, CreateChecklistItemRequest } from '../types/api'

export const createChecklist = (data: CreateChecklistRequest): Promise<Checklist> =>
  client.post<Checklist>('/checklists', data).then(res => res.data)

export const createChecklistItem = (checklistId: string, data: CreateChecklistItemRequest): Promise<ChecklistItem> =>
  client.post<ChecklistItem>(`/checklists/${checklistId}/items`, data).then(res => res.data)
