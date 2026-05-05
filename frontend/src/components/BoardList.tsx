import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoards } from '../hooks/useBoards'
import CreateBoardModal from './CreateBoardModal'
import ConfirmDialog from './ConfirmDialog'
import Spinner from './Spinner'
import { deleteBoard } from '../api/boards'

const BG_COLORS = [
  'bg-blue-600', 'bg-yellow-600', 'bg-green-700',
  'bg-red-700', 'bg-purple-700', 'bg-teal-600',
]

export default function BoardList() {
  const { boards, loading, error, refetch } = useBoards()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null)

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
            <button
              onClick={() => navigate(`/boards/${board.id}`)}
              className="w-full h-full text-white text-left p-3 font-bold text-sm hover:brightness-110 transition cursor-pointer rounded-md"
            >
              {board.title}
            </button>
            <button
              onClick={e => { e.stopPropagation(); setConfirmDeleteId(board.id) }}
              className="absolute top-1.5 right-1.5 p-1 rounded text-white/60 hover:text-white hover:bg-black/20 opacity-0 group-hover:opacity-100 transition cursor-pointer"
              title="ボードを削除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <CreateBoardModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refetch}
      />

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
