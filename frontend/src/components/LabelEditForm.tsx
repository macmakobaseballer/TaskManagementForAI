import { useState } from 'react'
import { updateLabel } from '../api/labels'
import type { Label } from '../types/api'
import Spinner from './Spinner'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

interface Props {
  label: Label
  onSaved: (updated: Label) => void
  onCancel: () => void
}

export default function LabelEditForm({ label, onSaved, onCancel }: Props) {
  const [name, setName] = useState(label.name)
  const [color, setColor] = useState(label.color)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const updated = await updateLabel(label.id, { name: name.trim(), color })
      onSaved(updated)
    } catch {
      setError('ラベルの更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-2 border-blue-400 rounded-lg p-3 space-y-2 bg-blue-50">
      <div className="text-xs font-semibold text-blue-600 mb-1">ラベルを編集</div>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="ラベル名"
      />
      <div className="flex justify-between mt-1">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full cursor-pointer transition ${color === c ? 'ring-2 ring-offset-2 ring-gray-700 scale-110' : 'hover:scale-110'}`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">プレビュー:</span>
        <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: color }}>
          {name || '…'}
        </span>
      </div>
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="flex-1 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
        >
          {saving && <Spinner className="w-3.5 h-3.5 text-white" />}
          保存
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
