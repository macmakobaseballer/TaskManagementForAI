import { useState, useRef, useEffect } from 'react'
import { useCardDetail } from '../hooks/useCardDetail'
import { updateCard, addLabelToCard, removeLabelFromCard, deleteCard } from '../api/cards'
import { toggleChecklistItem as apiToggle, updateChecklist, updateChecklistItem, deleteChecklist, deleteChecklistItem } from '../api/checklists'
import { fetchLabelsByBoard } from '../api/labels'
import CreateChecklistForm from './CreateChecklistForm'
import CreateChecklistItemForm from './CreateChecklistItemForm'
import Spinner from './Spinner'
import type { Label } from '../types/api'

interface Props {
  cardId: string
  boardId: string
  onClose: () => void
  onSaved?: () => void
}

export default function CardDetail({ cardId, boardId, onClose, onSaved }: Props) {
  const { card, loading, error, refetch } = useCardDetail(cardId)

  // カードフィールド編集（一括保存）
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [editDueDate, setEditDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [initializedForId, setInitializedForId] = useState<string | null>(null)

  // カード削除
  const [deletingCard, setDeletingCard] = useState(false)

  // チェックリスト削除
  const [deletingChecklistId, setDeletingChecklistId] = useState<string | null>(null)

  // アイテム削除
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

  useEffect(() => {
    if (card && card.id !== initializedForId) {
      setEditTitle(card.title)
      setEditDesc(card.description ?? '')
      setEditPriority(card.priority)
      setEditDueDate(card.dueDate ?? '')
      setInitializedForId(card.id)
    }
  }, [card, initializedForId])

  const handleSave = async () => {
    if (!card || !editTitle.trim() || saving) return
    setSaving(true)
    try {
      await updateCard(card.id, {
        title: editTitle.trim(),
        description: editDesc || null,
        priority: editPriority,
        dueDate: editDueDate || null,
      })
      onSaved?.()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCard = async () => {
    if (!card || deletingCard) return
    setDeletingCard(true)
    try {
      await deleteCard(card.id)
      onSaved?.()
      onClose()
    } finally {
      setDeletingCard(false)
    }
  }

  const handleDeleteChecklist = async (checklistId: string) => {
    if (deletingChecklistId) return
    setDeletingChecklistId(checklistId)
    try {
      await deleteChecklist(checklistId)
      await refetch()
    } finally {
      setDeletingChecklistId(null)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (deletingItemId) return
    setDeletingItemId(itemId)
    try {
      await deleteChecklistItem(itemId)
      await refetch()
    } finally {
      setDeletingItemId(null)
    }
  }

  // ラベルドロップダウン
  const [boardLabels, setBoardLabels] = useState<Label[]>([])
  const [showLabelDropdown, setShowLabelDropdown] = useState(false)
  const [togglingLabelId, setTogglingLabelId] = useState<string | null>(null)
  const labelDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchLabelsByBoard(boardId).then(setBoardLabels).catch(() => {})
  }, [boardId])

  useEffect(() => {
    if (!showLabelDropdown) return
    const handleClickOutside = (e: MouseEvent) => {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(e.target as Node)) {
        setShowLabelDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLabelDropdown])

  const handleToggleLabel = async (labelId: string) => {
    if (!card || togglingLabelId) return
    setTogglingLabelId(labelId)
    try {
      if (card.labels.some(l => l.id === labelId)) {
        await removeLabelFromCard(card.id, labelId)
      } else {
        await addLabelToCard(card.id, labelId)
      }
      await refetch()
    } finally {
      setTogglingLabelId(null)
    }
  }

  // チェックリスト操作
  const handleToggleItem = async (itemId: string) => {
    await apiToggle(itemId)
    await refetch()
  }

  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null)
  const [editingChecklistTitle, setEditingChecklistTitle] = useState('')

  const startEditChecklistTitle = (id: string, title: string) => {
    setEditingChecklistId(id)
    setEditingChecklistTitle(title)
  }

  const saveChecklistTitle = async () => {
    if (!editingChecklistId || !editingChecklistTitle.trim()) { setEditingChecklistId(null); return }
    try {
      await updateChecklist(editingChecklistId, { title: editingChecklistTitle.trim() })
      await refetch()
    } finally {
      setEditingChecklistId(null)
    }
  }

  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemText, setEditingItemText] = useState('')

  const startEditItem = (id: string, text: string) => {
    setEditingItemId(id)
    setEditingItemText(text)
  }

  const saveItemText = async () => {
    if (!editingItemId || !editingItemText.trim()) { setEditingItemId(null); return }
    try {
      await updateChecklistItem(editingItemId, { text: editingItemText.trim() })
      await refetch()
    } finally {
      setEditingItemId(null)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-12 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <button
            onClick={handleDeleteCard}
            disabled={deletingCard}
            className="text-gray-400 hover:text-red-500 p-1 rounded cursor-pointer disabled:opacity-40"
            title="カードを削除"
          >
            {deletingCard
              ? <Spinner className="w-4 h-4" />
              : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )
            }
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none px-2 cursor-pointer"
          >
            ×
          </button>
        </div>

        {loading && !card && (
          <div className="flex items-center gap-2 text-gray-500 py-4">
            <Spinner /><span>読み込み中...</span>
          </div>
        )}
        {loading && card && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <Spinner className="w-4 h-4" />
          </div>
        )}
        {error && <p className="text-red-600">エラー: {error}</p>}

        {card && (
          <>
            {/* タイトル */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">タイトル</label>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="text-base font-bold w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="タイトルを入力"
              />
            </div>

            {/* ラベル（ドロップダウン） */}
            <div className="mb-4 relative" ref={labelDropdownRef}>
              <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">ラベル</label>
              <button
                type="button"
                onClick={() => setShowLabelDropdown(v => !v)}
                className="w-full text-left border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-gray-50 cursor-pointer min-h-[36px] flex items-center flex-wrap gap-1"
              >
                {card.labels.length > 0
                  ? card.labels.map(l => (
                      <span
                        key={l.id}
                        className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: l.color }}
                      >
                        {l.name}
                      </span>
                    ))
                  : <span className="text-gray-400">ラベルを選択...</span>
                }
              </button>

              {showLabelDropdown && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {boardLabels.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">ラベルがありません（ボードヘッダーから追加できます）</p>
                  ) : (
                    boardLabels.map(l => {
                      const checked = card.labels.some(cl => cl.id === l.id)
                      return (
                        <label
                          key={l.id}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleLabel(l.id)}
                            disabled={!!togglingLabelId}
                            className="cursor-pointer"
                          />
                          <span
                            className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: l.color }}
                          >
                            {l.name}
                          </span>
                          {togglingLabelId === l.id && <Spinner className="w-3 h-3 ml-auto" />}
                        </label>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            {/* 説明 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">説明</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="説明を追加..."
              />
            </div>

            {/* チェックリスト */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-400 uppercase">チェックリスト</div>
                <CreateChecklistForm cardId={card.id} onCreated={refetch} />
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
                          onChange={e => setEditingChecklistTitle(e.target.value)}
                          onBlur={saveChecklistTitle}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { e.preventDefault(); saveChecklistTitle() }
                            if (e.key === 'Escape') setEditingChecklistId(null)
                          }}
                          className="text-sm font-semibold flex-1 mr-2 border-b-2 border-blue-400 focus:outline-none"
                        />
                      ) : (
                        <span
                          className="text-sm font-semibold cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1"
                          onDoubleClick={() => startEditChecklistTitle(cl.id, cl.title)}
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
                            onChange={e => setEditingItemText(e.target.value)}
                            onBlur={saveItemText}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { e.preventDefault(); saveItemText() }
                              if (e.key === 'Escape') setEditingItemId(null)
                            }}
                            className="text-sm flex-1 border-b border-blue-400 focus:outline-none"
                          />
                        ) : (
                          <span
                            className={`text-sm cursor-pointer hover:bg-gray-100 rounded px-0.5 flex-1 ${item.isCompleted ? 'line-through text-gray-400' : ''}`}
                            onDoubleClick={() => startEditItem(item.id, item.text)}
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
                    <CreateChecklistItemForm checklistId={cl.id} onCreated={refetch} />
                  </div>
                )
              })}
            </div>

            {/* 優先度・期日 */}
            <div className="flex gap-4 flex-wrap mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">優先度</label>
                <select
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value as 'high' | 'medium' | 'low')}
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                >
                  <option value="high">高 (high)</option>
                  <option value="medium">中 (medium)</option>
                  <option value="low">低 (low)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">期日</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="pb-2">
              <button
                onClick={handleSave}
                disabled={saving || !editTitle.trim()}
                className="w-full py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {saving && <Spinner className="w-4 h-4 text-white" />}
                保存
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
