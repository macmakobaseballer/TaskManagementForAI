import { useEffect } from 'react'
import Spinner from './Spinner'

interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  confirming?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '削除',
  confirming = false,
  onConfirm,
  onClose,
}: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-xl w-80 p-5">
        <h3 className="font-bold text-base mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={confirming}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer disabled:opacity-40"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {confirming && <Spinner className="w-3.5 h-3.5 text-white" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
