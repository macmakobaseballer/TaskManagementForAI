import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoards } from '../hooks/useBoards'
import CreateBoardModal from './CreateBoardModal'
import ConfirmDialog from './ConfirmDialog'
import Spinner from './Spinner'
import { deleteBoard, updateBoard } from '../api/boards'


function formatRelative(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return '今日'
  if (days === 1) return '昨日'
  if (days < 30) return `${days}日前`
  return new Date(dateStr).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

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

  if (error) return <div className="p-8 text-red-300 drop-shadow">エラー: {error}</div>

  if (loading && boards.length === 0) {
    return (
      <div className="p-8 flex items-center gap-2 text-white/80">
        <Spinner />
        <span>読み込み中...</span>
      </div>
    )
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white drop-shadow">あなたのボード</h2>
          {loading && <Spinner className="w-4 h-4 text-white" />}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          + 新しいボード
        </button>
      </div>
      {boards.length === 0 && (
        <p className="text-white/80">ボードがありません。新しいボードを作成してください。</p>
      )}
      <div className="flex flex-wrap gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            className="relative group w-72 h-40 rounded-xl overflow-hidden shadow-md ring-1 ring-white/40 hover:shadow-lg transition-shadow"
          >
            {/* カード本体（クリックで遷移） */}
            <button
              onClick={() => navigate(`/boards/${board.id}`)}
              className="w-full h-full flex flex-col cursor-pointer hover:brightness-95 transition-[filter]"
            >
              {/* 上部: タイトルエリア */}
              <div className="flex-1 bg-white/70 backdrop-blur-md px-3 py-2.5 flex items-start">
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
                    className="w-full bg-white/60 text-gray-800 font-bold text-sm rounded px-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={savingRename}
                  />
                ) : (
                  <span className="font-bold text-gray-800 text-base leading-snug text-left">{board.title}</span>
                )}
              </div>
              {/* 下部: メタ情報エリア */}
              <div className="bg-white/50 backdrop-blur-md px-3 py-2.5 flex flex-col gap-1 text-xs text-gray-700 border-t border-white/40">
                <span>作成: {new Date(board.createdAt).toLocaleDateString('ja-JP')}</span>
                <span>更新: {formatRelative(board.updatedAt)}</span>
              </div>
            </button>

            {/* 三点リーダーボタン */}
            <div className="absolute top-1.5 right-1.5" ref={openMenuId === board.id ? menuRef : undefined}>
              <button
                onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === board.id ? null : board.id) }}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition cursor-pointer"
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
