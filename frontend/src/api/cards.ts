import client from './client'
import type { CardDetail } from '../types/api'

export const fetchCardDetail = (cardId: string): Promise<CardDetail> =>
  client.get<CardDetail>(`/cards/${cardId}`).then(res => res.data)
