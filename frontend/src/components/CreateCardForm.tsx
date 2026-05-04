import { useState, useRef, useEffect } from 'react'
import { createCard } from '../api/cards'

interface Props {
  listId: string
  onCreated: () => void
}

export default function CreateCardForm({ listId, onCreated }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (expanded) textareaRef.current?.focus()
  }, [expanded])

  const cancel = () => {
    setExpanded(false)
    setTitle('')
    setPriority('medium')
    setDueDate('')
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
      await createCard({
        title: title.trim(),
        listId,
        priority,
        dueDate: dueDate || null,
      })
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
        className="w-full text-left px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-200 rounded transition cursor-pointer"
      >
        + カードを追加
      </button>
    )
  }

  return (
    <div className="bg-white rounded px-2.5 py-2 shadow-sm">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
        placeholder="カードのタイトル"
        rows={2}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
      />
      <div className="flex gap-2 mb-2">
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as 'high' | 'medium' | 'low')}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
        >
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
        />
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || submitting}
          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? '追加中...' : 'カードを追加'}
        </button>
        <button onClick={cancel} className="text-gray-500 hover:text-gray-700 text-lg leading-none cursor-pointer">×</button>
      </div>
    </div>
  )
}
