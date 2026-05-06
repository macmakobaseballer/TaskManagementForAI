import { useState } from 'react'
import { useCardDetail } from '../hooks/useCardDetail'
import { updateCard, deleteCard } from '../api/cards'
import Spinner from './Spinner'
import CardLabelSection from './card/CardLabelSection'
import CardChecklistSection from './card/CardChecklistSection'

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

  // カード削除
  const [deletingCard, setDeletingCard] = useState(false)

  // card が変化（別カードを開いた場合）したらフォームを初期化（render during render パターン）
  const [prevCardId, setPrevCardId] = useState<string | null>(null)
  if (card && card.id !== prevCardId) {
    setPrevCardId(card.id)
    setEditTitle(card.title)
    setEditDesc(card.description ?? '')
    setEditPriority(card.priority)
    setEditDueDate(card.dueDate ?? '')
  }

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

            {/* ラベル */}
            <CardLabelSection
              cardId={card.id}
              boardId={boardId}
              selectedLabels={card.labels}
              onChanged={refetch}
            />

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
            <CardChecklistSection card={card} onRefetch={refetch} />

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
