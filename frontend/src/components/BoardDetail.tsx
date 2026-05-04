import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBoardDetail } from '../hooks/useBoardDetail'
import CardDetail from './CardDetail'
import CreateListForm from './CreateListForm'
import CreateCardForm from './CreateCardForm'
import Spinner from './Spinner'
import type { CardSummary } from '../types/api'

const PRIORITY_BADGE: Record<string, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100 text-green-700',
}
const PRIORITY_LABEL: Record<string, string> = {
  high: '高', medium: '中', low: '低',
}

export default function BoardDetail() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { board, loading, error, refetch } = useBoardDetail(boardId ?? '')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  if (error) return <div className="p-8 text-red-600">エラー: {error}</div>

  // 初回ロード（データなし）はフルスピナー
  if (loading && !board) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-500">
        <Spinner />
        <span>読み込み中...</span>
      </div>
    )
  }

  if (!board) return null

  const sortedLists = [...board.lists].sort((a, b) => a.position - b.position)

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      <div className="bg-blue-600/80 text-white px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-sm px-3 py-1 rounded bg-white/20 hover:bg-white/30 cursor-pointer"
        >
          ← 一覧へ
        </button>
        <span className="font-bold">{board.title}</span>
        {loading && <Spinner className="w-4 h-4 text-white" />}
      </div>

      <div className="relative flex-1 overflow-x-auto p-3 flex gap-3 items-start bg-blue-500/20">
        {sortedLists.map(list => {
          const sortedCards = [...list.cards].sort((a, b) => a.position - b.position)
          return (
            <div key={list.id} className="w-72 flex-shrink-0 bg-gray-100 rounded-md flex flex-col">
              <div className="px-3 py-2 font-bold text-sm text-gray-700">{list.title}</div>
              <div className="px-2 pb-1 flex flex-col gap-1.5">
                {sortedCards.map(card => (
                  <CardTile
                    key={card.id}
                    card={card}
                    onClick={() => setSelectedCardId(card.id)}
                  />
                ))}
              </div>
              <div className="px-2 pb-2">
                <CreateCardForm listId={list.id} onCreated={refetch} />
              </div>
            </div>
          )
        })}
        <CreateListForm boardId={board.id} onCreated={refetch} />

        {/* refetch中のオーバーレイ（既存データを隠さずスピナーを表示） */}
        {loading && (
          <div className="absolute inset-0 bg-white/30 flex items-center justify-center pointer-events-none">
            <Spinner className="w-8 h-8" />
          </div>
        )}
      </div>

      {selectedCardId && (
        <CardDetail
          cardId={selectedCardId}
          boardId={board.id}
          onClose={() => setSelectedCardId(null)}
        />
      )}
    </div>
  )
}

function CardTile({ card, onClick }: { card: CardSummary; onClick: () => void }) {
  const today = new Date().toISOString().slice(0, 10)
  const dueCls = !card.dueDate
    ? ''
    : card.dueDate < today
      ? 'text-red-600 font-semibold'
      : card.dueDate === today
        ? 'text-orange-500 font-semibold'
        : 'text-gray-500'

  return (
    <button
      onClick={onClick}
      className="bg-white rounded px-2.5 py-2 shadow-sm text-left hover:shadow-md transition w-full cursor-pointer"
    >
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {card.labels.map(l => (
            <span
              key={l.id}
              className="text-white text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: l.color }}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}
      <div className="text-sm leading-snug break-words text-gray-800">{card.title}</div>
      <div className="flex gap-2 mt-1.5 text-xs items-center">
        <span className={`font-bold px-1.5 py-0.5 rounded ${PRIORITY_BADGE[card.priority]}`}>
          {PRIORITY_LABEL[card.priority]}
        </span>
        {card.dueDate && (
          <span className={dueCls}>📅 {card.dueDate}</span>
        )}
      </div>
    </button>
  )
}
