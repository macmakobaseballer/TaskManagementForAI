export type ChecklistState = {
  editingChecklistId: string | null
  editingChecklistTitle: string
  deletingChecklistId: string | null
  editingItemId: string | null
  editingItemText: string
  deletingItemId: string | null
}

export type ChecklistAction =
  | { type: 'START_EDIT_CHECKLIST'; id: string; title: string }
  | { type: 'CHANGE_CHECKLIST_TITLE'; title: string }
  | { type: 'CANCEL_EDIT_CHECKLIST' }
  | { type: 'START_DELETE_CHECKLIST'; id: string }
  | { type: 'FINISH_DELETE_CHECKLIST' }
  | { type: 'START_EDIT_ITEM'; id: string; text: string }
  | { type: 'CHANGE_ITEM_TEXT'; text: string }
  | { type: 'CANCEL_EDIT_ITEM' }
  | { type: 'START_DELETE_ITEM'; id: string }
  | { type: 'FINISH_DELETE_ITEM' }

export const initialChecklistState: ChecklistState = {
  editingChecklistId: null,
  editingChecklistTitle: '',
  deletingChecklistId: null,
  editingItemId: null,
  editingItemText: '',
  deletingItemId: null,
}

export function checklistReducer(state: ChecklistState, action: ChecklistAction): ChecklistState {
  switch (action.type) {
    case 'START_EDIT_CHECKLIST':
      return { ...state, editingChecklistId: action.id, editingChecklistTitle: action.title }
    case 'CHANGE_CHECKLIST_TITLE':
      return { ...state, editingChecklistTitle: action.title }
    case 'CANCEL_EDIT_CHECKLIST':
      return { ...state, editingChecklistId: null, editingChecklistTitle: '' }
    case 'START_DELETE_CHECKLIST':
      return { ...state, deletingChecklistId: action.id }
    case 'FINISH_DELETE_CHECKLIST':
      return { ...state, deletingChecklistId: null }
    case 'START_EDIT_ITEM':
      return { ...state, editingItemId: action.id, editingItemText: action.text }
    case 'CHANGE_ITEM_TEXT':
      return { ...state, editingItemText: action.text }
    case 'CANCEL_EDIT_ITEM':
      return { ...state, editingItemId: null, editingItemText: '' }
    case 'START_DELETE_ITEM':
      return { ...state, deletingItemId: action.id }
    case 'FINISH_DELETE_ITEM':
      return { ...state, deletingItemId: null }
  }
}
