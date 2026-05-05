import client from './client'
import type { CardDetail, CreateCardRequest, UpdateCardRequest, UpdateCardPositionRequest } from '../types/api'

export const fetchCardDetail = (cardId: string): Promise<CardDetail> =>
  client.get<CardDetail>(`/cards/${cardId}`).then(res => res.data)

export const createCard = (data: CreateCardRequest): Promise<CardDetail> =>
  client.post<CardDetail>('/cards', data).then(res => res.data)

export const updateCard = (cardId: string, data: UpdateCardRequest): Promise<CardDetail> =>
  client.put<CardDetail>(`/cards/${cardId}`, data).then(res => res.data)

export const updateCardPosition = (cardId: string, data: UpdateCardPositionRequest): Promise<CardDetail> =>
  client.patch<CardDetail>(`/cards/${cardId}/position`, data).then(res => res.data)

export const addLabelToCard = (cardId: string, labelId: string): Promise<CardDetail> =>
  client.post<CardDetail>(`/cards/${cardId}/labels/${labelId}`).then(res => res.data)

export const removeLabelFromCard = (cardId: string, labelId: string): Promise<CardDetail> =>
  client.delete<CardDetail>(`/cards/${cardId}/labels/${labelId}`).then(res => res.data)

export const deleteCard = (cardId: string): Promise<void> =>
  client.delete(`/cards/${cardId}`).then(() => undefined)
