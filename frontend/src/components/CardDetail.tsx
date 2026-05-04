import { useState, useRef, useEffect } from 'react'
import { useCardDetail } from '../hooks/useCardDetail'
import { updateCard } from '../api/cards'
import { toggleChecklistItem as apiToggle, updateChecklist, updateChecklistItem } from '../api/checklists'
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

  // カードフィールド編集（一括保存）
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [editDueDate, setEditDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const initializedCardId = useRef<string | null>(null)

  // カードが初めてロードされたときだけ編集フィールドを初期化
  // refetch（チェックリストトグルなど）では上書きしない
  useEffect(() => {
    if (card && initializedCardId.current !== card.id) {
      setEditTitle(card.title)
      setEditDesc(card.description ?? '')
      setEditPriority(card.priority)
      setEditDueDate(card.dueDate ?? '')
      initializedCardId.current = card.id
    }
  }, [card])

  const isDirty = card
    ? editTitle.trim() !== card.title
      || editDesc !== (card.description ?? '')
      || editPriority !== card.priority
      || editDueDate !== (card.dueDate ?? '')
    : false

  // 一括保存（PUT /api/cards/{id} → 1トランザクション）
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
      await refetch()
    } finally {
      setSaving(false)
    }
  }

  // チェックリストアイテム トグル
  const handleToggleItem = async (itemId: string) => {
    await apiToggle(itemId)
    await refetch()
  }

  // チェックリストタイトル インライン編集
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null)
  const [editingChecklistTitle, setEditingChecklistTitle] = useState('')

  const startEditChecklistTitle = (checklistId: string, currentTitle: string) => {
    setEditingChecklistId(checklistId)
    setEditingChecklistTitle(currentTitle)
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

  // チェックリストアイテムテキスト インライン編集
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemText, setEditingItemText] = useState('')

  const startEditItem = (itemId: string, currentText: string) => {
    setEditingItemId(itemId)
    setEditingItemText(currentText)
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl pt-6 px-6 pb-0 relative overflow-hidden">
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
              <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">タイトル</label>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="text-base font-bold w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="タイトルを入力"
              />
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
              {card.labels.length > 0 ? (
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
              ) : (
                <span className="text-xs text-gray-400">なし</span>
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
              {[...card.checklists]
                .sort((a, b) => a.position - b.position)
                .map(cl => {
                  const done = cl.items.filter(i => i.isCompleted).length
                  const total = cl.items.length
                  const pct = total ? Math.round((done / total) * 100) : 0
                  return (
                    <div key={cl.id} className="mb-4">
                      <div className="flex justify-between items-center mb-1">
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
                        <span className="text-gray-400 text-xs ml-2 flex-shrink-0">{done}/{total} ({pct}%)</span>
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
                          </div>
                        ))}
                      <CreateChecklistItemForm checklistId={cl.id} onCreated={refetch} />
                    </div>
                  )
                })}
            </div>

            {/* 優先度・期日 */}
            <div className="flex gap-4 flex-wrap border-t pt-4 mb-4">
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

            {/* 一括保存ボタン（最下部・全幅） */}
            <div className="border-t pt-4 -mx-6 px-6 pb-0">
              {isDirty && !saving && (
                <p className="text-xs text-orange-500 mb-2">未保存の変更があります</p>
              )}
              <button
                onClick={handleSave}
                disabled={!isDirty || saving || !editTitle.trim()}
                className="w-full py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-b-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {saving && <Spinner className="w-4 h-4 text-white" />}
                保存
              </button>
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
