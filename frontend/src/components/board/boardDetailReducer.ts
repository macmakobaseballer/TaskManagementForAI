export type BoardDetailState = {
  editingListId: string | null
  editingListTitle: string
  confirmDeleteListId: string | null
  deletingListId: string | null
  confirmDeleteBoard: boolean
  deletingBoard: boolean
}

export type BoardDetailAction =
  | { type: 'START_EDIT_LIST'; listId: string; currentTitle: string }
  | { type: 'CHANGE_LIST_TITLE'; title: string }
  | { type: 'CANCEL_EDIT_LIST' }
  | { type: 'SAVE_EDIT_LIST' }
  | { type: 'CONFIRM_DELETE_LIST'; listId: string }
  | { type: 'CANCEL_DELETE_LIST' }
  | { type: 'START_DELETE_LIST' }
  | { type: 'FINISH_DELETE_LIST' }
  | { type: 'OPEN_DELETE_BOARD' }
  | { type: 'CANCEL_DELETE_BOARD' }
  | { type: 'START_DELETE_BOARD' }
  | { type: 'FINISH_DELETE_BOARD' }

export const initialBoardDetailState: BoardDetailState = {
  editingListId: null,
  editingListTitle: '',
  confirmDeleteListId: null,
  deletingListId: null,
  confirmDeleteBoard: false,
  deletingBoard: false,
}

export function boardDetailReducer(state: BoardDetailState, action: BoardDetailAction): BoardDetailState {
  switch (action.type) {
    case 'START_EDIT_LIST':
      return { ...state, editingListId: action.listId, editingListTitle: action.currentTitle }
    case 'CHANGE_LIST_TITLE':
      return { ...state, editingListTitle: action.title }
    case 'CANCEL_EDIT_LIST':
    case 'SAVE_EDIT_LIST':
      return { ...state, editingListId: null, editingListTitle: '' }
    case 'CONFIRM_DELETE_LIST':
      return { ...state, confirmDeleteListId: action.listId }
    case 'CANCEL_DELETE_LIST':
      return { ...state, confirmDeleteListId: null }
    case 'START_DELETE_LIST':
      return { ...state, deletingListId: state.confirmDeleteListId }
    case 'FINISH_DELETE_LIST':
      return { ...state, deletingListId: null, confirmDeleteListId: null }
    case 'OPEN_DELETE_BOARD':
      return { ...state, confirmDeleteBoard: true }
    case 'CANCEL_DELETE_BOARD':
      return { ...state, confirmDeleteBoard: false }
    case 'START_DELETE_BOARD':
      return { ...state, deletingBoard: true }
    case 'FINISH_DELETE_BOARD':
      return { ...state, deletingBoard: false }
  }
}
