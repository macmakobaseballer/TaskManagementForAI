import client from './client'
import type { CardDetail, CreateCardRequest } from '../types/api'

export const fetchCardDetail = (cardId: string): Promise<CardDetail> =>
  client.get<CardDetail>(`/cards/${cardId}`).then(res => res.data)

export const createCard = (data: CreateCardRequest): Promise<CardDetail> =>
  client.post<CardDetail>('/cards', data).then(res => res.data)
