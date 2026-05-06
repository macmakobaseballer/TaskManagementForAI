import { useState, useEffect, useRef } from 'react'
import { addLabelToCard, removeLabelFromCard } from '../../api/cards'
import { fetchLabelsByBoard } from '../../api/labels'
import Spinner from '../Spinner'
import type { Label } from '../../types/api'

interface Props {
  cardId: string
  boardId: string
  selectedLabels: Label[]
  onChanged: () => void
}

export default function CardLabelSection({ cardId, boardId, selectedLabels, onChanged }: Props) {
  const [boardLabels, setBoardLabels] = useState<Label[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [togglingLabelId, setTogglingLabelId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchLabelsByBoard(boardId).then(setBoardLabels).catch(() => {})
  }, [boardId])

  useEffect(() => {
    if (!showDropdown) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  const handleToggle = async (labelId: string) => {
    if (togglingLabelId) return
    setTogglingLabelId(labelId)
    try {
      if (selectedLabels.some(l => l.id === labelId)) {
        await removeLabelFromCard(cardId, labelId)
      } else {
        await addLabelToCard(cardId, labelId)
      }
      onChanged()
    } finally {
      setTogglingLabelId(null)
    }
  }

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">ラベル</label>
      <button
        type="button"
        onClick={() => setShowDropdown(v => !v)}
        className="w-full text-left border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-gray-50 cursor-pointer min-h-[36px] flex items-center flex-wrap gap-1"
      >
        {selectedLabels.length > 0
          ? selectedLabels.map(l => (
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

      {showDropdown && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {boardLabels.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">ラベルがありません（ボードヘッダーから追加できます）</p>
          ) : (
            boardLabels.map(l => {
              const checked = selectedLabels.some(sl => sl.id === l.id)
              return (
                <label
                  key={l.id}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggle(l.id)}
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
  )
}
