import { useState, useEffect, useRef } from 'react'
import { fetchLabelsByBoard, deleteLabel } from '../api/labels'
import { addLabelToCard, removeLabelFromCard } from '../api/cards'
import type { Label } from '../types/api'
import Spinner from './Spinner'
import LabelCreateForm from './LabelCreateForm'
import LabelEditForm from './LabelEditForm'

interface Props {
  boardId: string
  cardId?: string
  cardLabelIds?: string[]
  onClose: () => void
  onLabelsChanged: () => void
}

export default function LabelModal({ boardId, cardId, cardLabelIds = [], onClose, onLabelsChanged }: Props) {
  const [labels, setLabels] = useState<Label[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // onClose を ref で保持し、useEffect の依存配列から除外する
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    fetchLabelsByBoard(boardId)
      .then(setLabels)
      .catch(() => setFetchError('ラベルの読み込みに失敗しました'))
  }, [boardId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (editingId) { setEditingId(null); return }
      if (showAddForm) { setShowAddForm(false); return }
      onCloseRef.current()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [editingId, showAddForm])

  const handleDeleteLabel = async (labelId: string) => {
    if (deletingId) return
    setDeletingId(labelId)
    try {
      await deleteLabel(labelId)
      setLabels(prev => prev.filter(l => l.id !== labelId))
      onLabelsChanged()
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleCard = async (label: Label) => {
    if (!cardId || togglingId) return
    setTogglingId(label.id)
    try {
      if (cardLabelIds.includes(label.id)) {
        await removeLabelFromCard(cardId, label.id)
      } else {
        await addLabelToCard(cardId, label.id)
      }
      onLabelsChanged()
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-xl w-96 p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base">ラベル管理</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none cursor-pointer">×</button>
        </div>

        {fetchError && <p className="text-red-600 text-sm mb-3">{fetchError}</p>}

        {labels.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">既存ラベル</div>
            <div className="space-y-2">
              {labels.map(l => (
                <div key={l.id}>
                  {editingId === l.id ? (
                    <LabelEditForm
                      label={l}
                      onSaved={updated => {
                        setLabels(prev => prev.map(x => x.id === updated.id ? updated : x))
                        onLabelsChanged()
                        setEditingId(null)
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-0.5">
                      {cardId && (
                        <input
                          type="checkbox"
                          checked={cardLabelIds.includes(l.id)}
                          onChange={() => handleToggleCard(l)}
                          disabled={!!togglingId}
                          className="cursor-pointer"
                          title="このカードに付与/除去"
                        />
                      )}
                      <span
                        className="text-white text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: l.color }}
                      >
                        {l.name}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => setEditingId(l.id)}
                          className="text-xs text-gray-400 hover:text-blue-600 cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-100"
                          title="編集"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteLabel(l.id)}
                          disabled={!!deletingId}
                          className="text-xs text-gray-400 hover:text-red-600 cursor-pointer px-1.5 py-0.5 rounded hover:bg-red-50 disabled:opacity-40"
                          title="削除"
                        >
                          {deletingId === l.id ? <Spinner className="w-3 h-3" /> : '削除'}
                        </button>
                      </div>
                      {togglingId === l.id && <Spinner className="w-3 h-3" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 cursor-pointer"
            >
              + ラベルの追加
            </button>
          ) : (
            <LabelCreateForm
              boardId={boardId}
              onCreated={created => {
                setLabels(prev => [...prev, created])
                setShowAddForm(false)
                onLabelsChanged()
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
