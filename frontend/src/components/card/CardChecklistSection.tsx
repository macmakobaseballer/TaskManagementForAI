import { useReducer } from 'react'
import { toggleChecklistItem as apiToggle, updateChecklist, updateChecklistItem, deleteChecklist, deleteChecklistItem } from '../../api/checklists'
import CreateChecklistForm from '../CreateChecklistForm'
import CreateChecklistItemForm from '../CreateChecklistItemForm'
import Spinner from '../Spinner'
import { checklistReducer, initialChecklistState } from './checklistReducer'
import type { CardDetail } from '../../types/api'

interface Props {
  card: CardDetail
  onRefetch: () => Promise<void>
}

export default function CardChecklistSection({ card, onRefetch }: Props) {
  const [state, dispatch] = useReducer(checklistReducer, initialChecklistState)
  const {
    editingChecklistId, editingChecklistTitle,
    deletingChecklistId,
    editingItemId, editingItemText,
    deletingItemId,
  } = state

  const handleDeleteChecklist = async (checklistId: string) => {
    if (deletingChecklistId) return
    dispatch({ type: 'START_DELETE_CHECKLIST', id: checklistId })
    try {
      await deleteChecklist(checklistId)
      await onRefetch()
    } finally {
      dispatch({ type: 'FINISH_DELETE_CHECKLIST' })
    }
  }

  const saveChecklistTitle = async () => {
    if (!editingChecklistId || !editingChecklistTitle.trim()) {
      dispatch({ type: 'CANCEL_EDIT_CHECKLIST' })
      return
    }
    try {
      await updateChecklist(editingChecklistId, { title: editingChecklistTitle.trim() })
      await onRefetch()
    } finally {
      dispatch({ type: 'CANCEL_EDIT_CHECKLIST' })
    }
  }

  const handleToggleItem = async (itemId: string) => {
    await apiToggle(itemId)
    await onRefetch()
  }

  const saveItemText = async () => {
    if (!editingItemId || !editingItemText.trim()) {
      dispatch({ type: 'CANCEL_EDIT_ITEM' })
      return
    }
    try {
      await updateChecklistItem(editingItemId, { text: editingItemText.trim() })
      await onRefetch()
    } finally {
      dispatch({ type: 'CANCEL_EDIT_ITEM' })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (deletingItemId) return
    dispatch({ type: 'START_DELETE_ITEM', id: itemId })
    try {
      await deleteChecklistItem(itemId)
      await onRefetch()
    } finally {
      dispatch({ type: 'FINISH_DELETE_ITEM' })
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-400 uppercase">チェックリスト</div>
        <CreateChecklistForm cardId={card.id} onCreated={onRefetch} />
      </div>
      {[...card.checklists].sort((a, b) => a.position - b.position).map(cl => {
        const done = cl.items.filter(i => i.isCompleted).length
        const total = cl.items.length
        const pct = total ? Math.round((done / total) * 100) : 0
        return (
          <div key={cl.id} className="mb-4">
            <div className="flex justify-between items-center mb-1 group">
              {editingChecklistId === cl.id ? (
                <input
                  autoFocus
                  value={editingChecklistTitle}
                  onChange={e => dispatch({ type: 'CHANGE_CHECKLIST_TITLE', title: e.target.value })}
                  onBlur={saveChecklistTitle}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); saveChecklistTitle() }
                    if (e.key === 'Escape') dispatch({ type: 'CANCEL_EDIT_CHECKLIST' })
                  }}
                  className="text-sm font-semibold flex-1 mr-2 border-b-2 border-blue-400 focus:outline-none"
                />
              ) : (
                <span
                  className="text-sm font-semibold cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1"
                  onDoubleClick={() => dispatch({ type: 'START_EDIT_CHECKLIST', id: cl.id, title: cl.title })}
                  title="ダブルクリックして編集"
                >
                  {cl.title}
                </span>
              )}
              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                <span className="text-gray-400 text-xs">{done}/{total} ({pct}%)</span>
                <button
                  onClick={() => handleDeleteChecklist(cl.id)}
                  disabled={deletingChecklistId === cl.id}
                  className="p-0.5 rounded text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer disabled:opacity-40"
                  title="チェックリストを削除"
                >
                  {deletingChecklistId === cl.id
                    ? <Spinner className="w-3.5 h-3.5" />
                    : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )
                  }
                </button>
              </div>
            </div>
            <div className="h-1.5 bg-gray-200 rounded mb-2 overflow-hidden">
              <div
                className={`h-full rounded transition-all ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {[...cl.items].sort((a, b) => a.position - b.position).map(item => (
              <div key={item.id} className="flex items-center gap-2 py-0.5">
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleToggleItem(item.id)}
                  className="cursor-pointer flex-shrink-0"
                />
                {editingItemId === item.id ? (
                  <input
                    autoFocus
                    value={editingItemText}
                    onChange={e => dispatch({ type: 'CHANGE_ITEM_TEXT', text: e.target.value })}
                    onBlur={saveItemText}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); saveItemText() }
                      if (e.key === 'Escape') dispatch({ type: 'CANCEL_EDIT_ITEM' })
                    }}
                    className="text-sm flex-1 border-b border-blue-400 focus:outline-none"
                  />
                ) : (
                  <span
                    className={`text-sm cursor-pointer hover:bg-gray-100 rounded px-0.5 flex-1 ${item.isCompleted ? 'line-through text-gray-400' : ''}`}
                    onDoubleClick={() => dispatch({ type: 'START_EDIT_ITEM', id: item.id, text: item.text })}
                    title="ダブルクリックして編集"
                  >
                    {item.text}
                  </span>
                )}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={deletingItemId === item.id}
                  className="p-0.5 rounded text-gray-300 hover:text-red-500 transition cursor-pointer disabled:opacity-40 flex-shrink-0"
                  title="削除"
                >
                  {deletingItemId === item.id
                    ? <Spinner className="w-3 h-3" />
                    : <span className="text-xs leading-none">✕</span>
                  }
                </button>
              </div>
            ))}
            <CreateChecklistItemForm checklistId={cl.id} onCreated={onRefetch} />
          </div>
        )
      })}
    </div>
  )
}
