import { useState, useRef, useEffect } from 'react'
import { createChecklist } from '../api/checklists'

interface Props {
  cardId: string
  onCreated: () => void
}

export default function CreateChecklistForm({ cardId, onCreated }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  const cancel = () => {
    setExpanded(false)
    setTitle('')
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel() }
    if (expanded) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [expanded])

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return
    setSubmitting(true)
    try {
      await createChecklist({ title: title.trim(), cardId })
      onCreated()
      cancel()
    } finally {
      setSubmitting(false)
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
      >
        + チェックリストを追加
      </button>
    )
  }

  return (
    <div className="mt-2 flex gap-2 items-center">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
        placeholder="チェックリストのタイトル"
        className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={handleSubmit}
        disabled={!title.trim() || submitting}
        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
      >
        {submitting ? '追加中...' : '追加'}
      </button>
      <button onClick={cancel} className="text-gray-500 hover:text-gray-700 text-lg leading-none cursor-pointer">×</button>
    </div>
  )
}
