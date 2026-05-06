import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoards } from '../hooks/useBoards'
import CreateBoardModal from './CreateBoardModal'
import ConfirmDialog from './ConfirmDialog'
import Spinner from './Spinner'
import { deleteBoard, updateBoard } from '../api/boards'

const BG_COLORS = [
  'bg-blue-600', 'bg-yellow-600', 'bg-green-700',
  'bg-red-700', 'bg-purple-700', 'bg-teal-600',
]

export default function BoardList() {
  const { boards, loading, error, refetch } = useBoards()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)

  // 三点メニュー
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // ボード削除
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null)

  // ボード名変更
  const [renamingBoardId, setRenamingBoardId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [savingRename, setSavingRename] = useState(false)
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!openMenuId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  useEffect(() => {
    if (renamingBoardId) {
      setTimeout(() => renameInputRef.current?.select(), 0)
    }
  }, [renamingBoardId])

  const openRename = (boardId: string, currentTitle: string) => {
    setOpenMenuId(null)
    setRenamingBoardId(boardId)
    setRenameValue(currentTitle)
  }

  const saveRename = async () => {
    if (!renamingBoardId || !renameValue.trim() || savingRename) return
    setSavingRename(true)
    try {
      await updateBoard(renamingBoardId, { title: renameValue.trim() })
      setRenamingBoardId(null)
      refetch()
    } finally {
      setSavingRename(false)
    }
  }

  const handleDeleteBoard = async () => {
    if (!confirmDeleteId) return
    setDeletingBoardId(confirmDeleteId)
    try {
      await deleteBoard(confirmDeleteId)
      setConfirmDeleteId(null)
      refetch()
    } finally {
      setDeletingBoardId(null)
    }
  }

  if (error) return <div className="p-8 text-red-600">エラー: {error}</div>

  if (loading && boards.length === 0) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-500">
        <Spinner />
        <span>読み込み中...</span>
      </div>
    )
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">あなたのボード</h2>
          {loading && <Spinner className="w-4 h-4" />}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          + 新しいボード
        </button>
      </div>
      {boards.length === 0 && (
        <p className="text-gray-500">ボードがありません。新しいボードを作成してください。</p>
      )}
      <div className="flex flex-wrap gap-4">
        {boards.map((board, i) => (
          <div
            key={board.id}
            className={`relative group w-48 h-24 rounded-md ${BG_COLORS[i % BG_COLORS.length]}`}
          >
            {/* ボードカード本体（クリックで遷移） */}
            <button
              onClick={() => navigate(`/boards/${board.id}`)}
              className="w-full h-full text-white text-left p-3 font-bold text-sm hover:brightness-110 transition cursor-pointer rounded-md"
            >
              {renamingBoardId === board.id ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onBlur={saveRename}
                  onKeyDown={e => {
                    e.stopPropagation()
                    if (e.key === 'Enter') saveRename()
                    if (e.key === 'Escape') setRenamingBoardId(null)
                  }}
                  className="w-full bg-white/20 text-white font-bold text-sm rounded px-1 focus:outline-none focus:ring-2 focus:ring-white/60"
                  disabled={savingRename}
                />
              ) : (
                board.title
              )}
            </button>

            {/* 三点リーダーボタン */}
            <div className="absolute top-1.5 right-1.5" ref={openMenuId === board.id ? menuRef : undefined}>
              <button
                onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === board.id ? null : board.id) }}
                className="p-1 rounded text-white/60 hover:text-white hover:bg-black/20 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="メニュー"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>

              {openMenuId === board.id && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={e => { e.stopPropagation(); openRename(board.id, board.title) }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    名前を変更
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setOpenMenuId(null); setConfirmDeleteId(board.id) }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateBoardModal
          onClose={() => setShowCreate(false)}
          onCreated={refetch}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="ボードを削除"
        message={`「${boards.find(b => b.id === confirmDeleteId)?.title}」を削除しますか？この操作は元に戻せません。`}
        confirming={!!deletingBoardId}
        onConfirm={handleDeleteBoard}
        onClose={() => setConfirmDeleteId(null)}
      />
    </main>
  )
}
