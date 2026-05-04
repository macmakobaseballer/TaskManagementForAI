import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoards } from '../hooks/useBoards'
import CreateBoardModal from './CreateBoardModal'
import Spinner from './Spinner'

const BG_COLORS = [
  'bg-blue-600', 'bg-yellow-600', 'bg-green-700',
  'bg-red-700', 'bg-purple-700', 'bg-teal-600',
]

export default function BoardList() {
  const { boards, loading, error, refetch } = useBoards()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)

  if (error) return <div className="p-8 text-red-600">エラー: {error}</div>

  // 初回ロード（データなし）はフルスピナー
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
          <button
            key={board.id}
            onClick={() => navigate(`/boards/${board.id}`)}
            className={`w-48 h-24 rounded-md ${BG_COLORS[i % BG_COLORS.length]} text-white text-left p-3 font-bold text-sm hover:brightness-110 transition cursor-pointer`}
          >
            {board.title}
          </button>
        ))}
      </div>

      <CreateBoardModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refetch}
      />
    </main>
  )
}
