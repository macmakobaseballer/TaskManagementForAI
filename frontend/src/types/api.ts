export interface BoardSummary {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface CardSummary {
  id: string
  title: string
  description: string | null
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  position: number
  labels: Label[]
}

export interface TaskList {
  id: string
  title: string
  position: number
  cards: CardSummary[]
}

export interface BoardDetail {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  lists: TaskList[]
}

export interface ChecklistItem {
  id: string
  text: string
  isCompleted: boolean
  position: number
}

export interface Checklist {
  id: string
  title: string
  position: number
  items: ChecklistItem[]
}

export interface CardDetail {
  id: string
  listId: string
  title: string
  description: string | null
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  position: number
  createdAt: string
  updatedAt: string
  labels: Label[]
  checklists: Checklist[]
}
