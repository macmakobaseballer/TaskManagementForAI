import { useState, useEffect } from 'react'
import { fetchLabelsByBoard, createLabel } from '../api/labels'
import type { Label } from '../types/api'
import Spinner from './Spinner'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

interface Props {
  boardId: string
  onClose: () => void
  onLabelsChanged: () => void
}

export default function LabelModal({ boardId, onClose, onLabelsChanged }: Props) {
  const [labels, setLabels] = useState<Label[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLabelsByBoard(boardId).then(setLabels).catch(() => {})
  }, [boardId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleAdd = async () => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const created = await createLabel({ name: name.trim(), color, boardId })
      setLabels(prev => [...prev, created])
      setName('')
      onLabelsChanged()
    } catch {
      setError('ラベルの作成に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-xl w-80 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base">ラベル管理</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none cursor-pointer">×</button>
        </div>

        {labels.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">既存ラベル</div>
            <div className="flex flex-wrap gap-1.5">
              {labels.map(l => (
                <span
                  key={l.id}
                  className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: l.color }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2">新しいラベルを追加</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            placeholder="ラベル名"
            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          />
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full cursor-pointer transition ${color === c ? 'ring-2 ring-offset-1 ring-gray-600' : ''}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
          <button
            onClick={handleAdd}
            disabled={!name.trim() || submitting}
            className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? <span className="flex items-center justify-center gap-1.5"><Spinner className="w-3.5 h-3.5 text-white" />追加中</span> : '追加'}
          </button>
        </div>
      </div>
    </div>
  )
}
