import { useState, useRef } from 'react'
import { useCardDetail } from '../hooks/useCardDetail'
import { updateCard, toggleChecklistItem as apiToggle } from '../api/cards'
import CreateChecklistForm from './CreateChecklistForm'
import CreateChecklistItemForm from './CreateChecklistItemForm'
import LabelModal from './LabelModal'
import Spinner from './Spinner'

interface Props {
  cardId: string
  boardId: string
  onClose: () => void
}

export default function CardDetail({ cardId, boardId, onClose }: Props) {
  const { card, loading, error, refetch } = useCardDetail(cardId)
  const [showLabelModal, setShowLabelModal] = useState(false)

  // インライン編集ステート
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [editingDesc, setEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState('')
  const [savingField, setSavingField] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)

  const startEditTitle = () => {
    if (!card) return
    setTitleValue(card.title)
    setEditingTitle(true)
    setTimeout(() => titleRef.current?.select(), 0)
  }

  const saveTitle = async () => {
    if (!card || !titleValue.trim() || savingField) return
    if (titleValue.trim() === card.title) { setEditingTitle(false); return }
    setSavingField('title')
    try {
      await updateCard(card.id, {
        title: titleValue.trim(),
        description: card.description,
        priority: card.priority,
        dueDate: card.dueDate,
      })
      await refetch()
    } finally {
      setSavingField(null)
      setEditingTitle(false)
    }
  }

  const startEditDesc = () => {
    if (!card) return
    setDescValue(card.description ?? '')
    setEditingDesc(true)
    setTimeout(() => descRef.current?.focus(), 0)
  }

  const saveDesc = async () => {
    if (!card || savingField) return
    if (descValue === (card.description ?? '')) { setEditingDesc(false); return }
    setSavingField('desc')
    try {
      await updateCard(card.id, {
        title: card.title,
        description: descValue || null,
        priority: card.priority,
        dueDate: card.dueDate,
      })
      await refetch()
    } finally {
      setSavingField(null)
      setEditingDesc(false)
    }
  }

  const savePriority = async (newPriority: string) => {
    if (!card) return
    setSavingField('priority')
    try {
      await updateCard(card.id, {
        title: card.title,
        description: card.description,
        priority: newPriority as 'high' | 'medium' | 'low',
        dueDate: card.dueDate,
      })
      await refetch()
    } finally {
      setSavingField(null)
    }
  }

  const saveDueDate = async (newDate: string) => {
    if (!card) return
    setSavingField('dueDate')
    try {
      await updateCard(card.id, {
        title: card.title,
        description: card.description,
        priority: card.priority,
        dueDate: newDate || null,
      })
      await refetch()
    } finally {
      setSavingField(null)
    }
  }

  const handleToggleItem = async (itemId: string) => {
    await apiToggle(itemId)
    await refetch()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-12 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl leading-none px-2 cursor-pointer"
        >
          ×
        </button>

        {loading && !card && (
          <div className="flex items-center gap-2 text-gray-500 py-4">
            <Spinner />
            <span>読み込み中...</span>
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
            <div className="mb-4 pr-8">
              {editingTitle ? (
                <input
                  ref={titleRef}
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveTitle()
                    if (e.key === 'Escape') setEditingTitle(false)
                  }}
                  className="text-lg font-bold w-full border-b-2 border-blue-400 focus:outline-none"
                  disabled={savingField === 'title'}
                />
              ) : (
                <h2
                  className="text-lg font-bold cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1"
                  onClick={startEditTitle}
                  title="クリックして編集"
                >
                  {card.title}
                </h2>
              )}
            </div>

            {/* ラベル */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-gray-400 uppercase">ラベル</div>
                <button
                  onClick={() => setShowLabelModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  + ラベル管理
                </button>
              </div>
              {card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {card.labels.map(l => (
                    <span
                      key={l.id}
                      className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: l.color }}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 説明 */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">説明</div>
              {editingDesc ? (
                <textarea
                  ref={descRef}
                  value={descValue}
                  onChange={e => setDescValue(e.target.value)}
                  onBlur={saveDesc}
                  onKeyDown={e => {
                    if (e.key === 'Escape') setEditingDesc(false)
                  }}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  disabled={savingField === 'desc'}
                />
              ) : (
                <div
                  className="text-sm text-gray-700 whitespace-pre-wrap cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1 min-h-[2rem]"
                  onClick={startEditDesc}
                  title="クリックして編集"
                >
                  {card.description || <span className="text-gray-400 italic">説明を追加...</span>}
                </div>
              )}
            </div>

            {/* チェックリスト */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-400 uppercase">チェックリスト</div>
                <CreateChecklistForm cardId={card.id} onCreated={refetch} />
              </div>
              {[...card.checklists]
                .sort((a, b) => a.position - b.position)
                .map(cl => {
                  const done = cl.items.filter(i => i.isCompleted).length
                  const total = cl.items.length
                  const pct = total ? Math.round((done / total) * 100) : 0
                  return (
                    <div key={cl.id} className="mb-3">
                      <div className="flex justify-between text-sm font-semibold mb-1">
                        <span>{cl.title}</span>
                        <span className="text-gray-400 text-xs">{done}/{total} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded mb-2 overflow-hidden">
                        <div
                          className={`h-full rounded transition-all ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {[...cl.items]
                        .sort((a, b) => a.position - b.position)
                        .map(item => (
                          <div key={item.id} className="flex items-center gap-2 py-0.5">
                            <input
                              type="checkbox"
                              checked={item.isCompleted}
                              onChange={() => handleToggleItem(item.id)}
                              className="cursor-pointer"
                            />
                            <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      <CreateChecklistItemForm checklistId={cl.id} onCreated={refetch} />
                    </div>
                  )
                })}
            </div>

            {/* 優先度・期日 */}
            <div className="border-t pt-3 flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <label className="font-semibold text-gray-400 uppercase">優先度</label>
                <select
                  value={card.priority}
                  onChange={e => savePriority(e.target.value)}
                  disabled={savingField === 'priority'}
                  className="border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                >
                  <option value="high">高 (high)</option>
                  <option value="medium">中 (medium)</option>
                  <option value="low">低 (low)</option>
                </select>
                {savingField === 'priority' && <Spinner className="w-3 h-3" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <label className="font-semibold text-gray-400 uppercase">期日</label>
                <input
                  type="date"
                  value={card.dueDate ?? ''}
                  onChange={e => saveDueDate(e.target.value)}
                  disabled={savingField === 'dueDate'}
                  className="border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                {savingField === 'dueDate' && <Spinner className="w-3 h-3" />}
              </div>
            </div>
          </>
        )}
      </div>

      {showLabelModal && card && (
        <LabelModal
          boardId={boardId}
          cardId={card.id}
          cardLabelIds={card.labels.map(l => l.id)}
          onClose={() => setShowLabelModal(false)}
          onLabelsChanged={refetch}
        />
      )}
    </div>
  )
}
