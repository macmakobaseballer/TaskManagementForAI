import { useState, useEffect } from 'react'
import { fetchLabelsByBoard, createLabel, updateLabel, deleteLabel } from '../api/labels'
import { addLabelToCard, removeLabelFromCard } from '../api/cards'
import type { Label } from '../types/api'
import Spinner from './Spinner'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

interface Props {
  boardId: string
  cardId?: string
  cardLabelIds?: string[]
  onClose: () => void
  onLabelsChanged: () => void
}

export default function LabelModal({ boardId, cardId, cardLabelIds = [], onClose, onLabelsChanged }: Props) {
  const [labels, setLabels] = useState<Label[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ラベル編集ステート
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState(PRESET_COLORS[0])
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // ラベル付与/除去
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // ラベル削除
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  useEffect(() => {
    fetchLabelsByBoard(boardId).then(setLabels).catch(() => {})
  }, [boardId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingId) { setEditingId(null); return }
        if (showAddForm) { setShowAddForm(false); return }
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, editingId, showAddForm])

  const openAddForm = () => {
    setNewName('')
    setNewColor(PRESET_COLORS[0])
    setError(null)
    setShowAddForm(true)
  }

  // 新規ラベル作成
  const handleCreate = async () => {
    if (!newName.trim() || creating) return
    setCreating(true)
    setError(null)
    try {
      const created = await createLabel({ name: newName.trim(), color: newColor, boardId })
      setLabels(prev => [...prev, created])
      setShowAddForm(false)
      onLabelsChanged()
    } catch {
      setError('ラベルの作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  // ラベル編集開始
  const startEdit = (label: Label) => {
    setEditingId(label.id)
    setEditName(label.name)
    setEditColor(label.color)
    setEditError(null)
  }

  // ラベル編集保存（PUT /api/labels/{id} → 1トランザクション）
  const saveEdit = async () => {
    if (!editingId || !editName.trim() || savingEdit) return
    setSavingEdit(true)
    setEditError(null)
    try {
      const updated = await updateLabel(editingId, { name: editName.trim(), color: editColor })
      setLabels(prev => prev.map(l => l.id === editingId ? updated : l))
      onLabelsChanged()
      setEditingId(null)
    } catch {
      setEditError('ラベルの更新に失敗しました')
    } finally {
      setSavingEdit(false)
    }
  }

  // カードへのラベル付与/除去
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

        {/* 既存ラベル一覧 */}
        {labels.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">既存ラベル</div>
            <div className="space-y-2">
              {labels.map(l => (
                <div key={l.id}>
                  {editingId === l.id ? (
                    /* ── 編集フォーム ── */
                    <div className="border-2 border-blue-400 rounded-lg p-3 space-y-2 bg-blue-50">
                      <div className="text-xs font-semibold text-blue-600 mb-1">ラベルを編集</div>
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="ラベル名"
                      />
                      <div className="flex justify-between mt-1">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setEditColor(c)}
                            className={`w-7 h-7 rounded-full cursor-pointer transition ${editColor === c ? 'ring-2 ring-offset-2 ring-gray-700 scale-110' : 'hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                      {/* プレビュー */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">プレビュー:</span>
                        <span
                          className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: editColor }}
                        >
                          {editName || '…'}
                        </span>
                      </div>
                      {editError && <p className="text-red-600 text-xs">{editError}</p>}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={saveEdit}
                          disabled={!editName.trim() || savingEdit}
                          className="flex-1 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {savingEdit && <Spinner className="w-3.5 h-3.5 text-white" />}
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── 通常表示行 ── */
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
                          onClick={() => startEdit(l)}
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

        {/* 新規ラベル作成 */}
        <div className="border-t pt-4">
          {!showAddForm ? (
            <button
              onClick={openAddForm}
              className="w-full py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 cursor-pointer"
            >
              + ラベルの追加
            </button>
          ) : (
            <div className="border-2 border-blue-400 rounded-lg p-3 space-y-2 bg-blue-50">
              <div className="text-xs font-semibold text-blue-600 mb-1">新しいラベル</div>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
                placeholder="ラベル名"
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-between mt-1">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full cursor-pointer transition ${newColor === c ? 'ring-2 ring-offset-2 ring-gray-600 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">プレビュー:</span>
                <span
                  className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: newColor }}
                >
                  {newName || '…'}
                </span>
              </div>
              {error && <p className="text-red-600 text-xs">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  className="flex-1 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {creating && <Spinner className="w-3.5 h-3.5 text-white" />}
                  保存
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
