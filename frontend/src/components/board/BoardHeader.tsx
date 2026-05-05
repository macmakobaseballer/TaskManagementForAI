import { useState, useRef, useEffect } from 'react'
import Spinner from '../Spinner'

interface Props {
  title: string
  loading: boolean
  onNavigateBack: () => void
  onOpenLabelManager: () => void
  onOpenDeleteBoard: () => void
}

export default function BoardHeader({ title, loading, onNavigateBack, onOpenLabelManager, onOpenDeleteBoard }: Props) {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const settingsMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showSettingsMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettingsMenu])

  return (
    <div className="bg-blue-600/80 text-white px-4 py-2 flex items-center gap-3 flex-shrink-0">
      <button
        onClick={onNavigateBack}
        className="text-sm px-3 py-1 rounded bg-white/20 hover:bg-white/30 cursor-pointer"
      >
        ← 一覧へ
      </button>
      <span className="font-bold">{title}</span>
      <div className="relative ml-auto" ref={settingsMenuRef}>
        <button
          onClick={() => setShowSettingsMenu(v => !v)}
          className="p-1.5 rounded bg-white/20 hover:bg-white/30 cursor-pointer"
          title="設定"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
        {showSettingsMenu && (
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={() => { setShowSettingsMenu(false); onOpenLabelManager() }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              ラベル管理
            </button>
            <button
              onClick={() => { setShowSettingsMenu(false); onOpenDeleteBoard() }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              ボードを削除
            </button>
          </div>
        )}
      </div>
      {loading && <Spinner className="w-4 h-4 text-white" />}
    </div>
  )
}
