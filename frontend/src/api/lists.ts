import client from './client'
import type { TaskList, CreateListRequest } from '../types/api'

export const createList = (data: CreateListRequest): Promise<TaskList> =>
  client.post<TaskList>('/lists', data).then(res => res.data)
