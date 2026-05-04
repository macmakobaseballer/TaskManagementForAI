import { useState, useRef, useEffect } from 'react'
import { createList } from '../api/lists'

interface Props {
  boardId: string
  onCreated: () => void
}

export default function CreateListForm({ boardId, onCreated }: Props) {
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
      await createList({ title: title.trim(), boardId })
      onCreated()
      setTitle('')
      inputRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  if (!expanded) {
    return (
      <div className="w-72 flex-shrink-0">
        <button
          onClick={() => setExpanded(true)}
          className="w-full bg-white/60 hover:bg-white/80 rounded-md px-3 py-2.5 text-sm text-gray-600 text-left transition cursor-pointer"
        >
          + リストを追加
        </button>
      </div>
    )
  }

  return (
    <div className="w-72 flex-shrink-0 bg-gray-100 rounded-md p-2">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
        placeholder="リストのタイトル"
        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
      />
      <div className="flex gap-2 items-center">
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || submitting}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? '追加中...' : 'リストを追加'}
        </button>
        <button onClick={cancel} className="text-gray-500 hover:text-gray-700 text-lg leading-none cursor-pointer">×</button>
      </div>
    </div>
  )
}
