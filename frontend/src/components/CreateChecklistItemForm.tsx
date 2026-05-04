import { useState, useRef, useEffect } from 'react'
import { createChecklistItem } from '../api/checklists'
import Spinner from './Spinner'

interface Props {
  checklistId: string
  onCreated: () => void
}

export default function CreateChecklistItemForm({ checklistId, onCreated }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  const cancel = () => {
    setExpanded(false)
    setText('')
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel() }
    if (expanded) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [expanded])

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    try {
      await createChecklistItem(checklistId, { text: text.trim() })
      onCreated()
      setText('')
      inputRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-gray-500 hover:text-gray-700 mt-1 cursor-pointer"
      >
        + 項目を追加
      </button>
    )
  }

  return (
    <div className="flex gap-2 items-center mt-1">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
        placeholder="項目のテキスト"
        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || submitting}
        className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
      >
        {submitting ? <Spinner className="w-3.5 h-3.5 text-white" /> : '追加'}
      </button>
      <button onClick={cancel} className="text-gray-500 hover:text-gray-700 text-base leading-none cursor-pointer">×</button>
    </div>
  )
}
