import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useBoardDetail } from '../hooks/useBoardDetail'
import { updateList, updateListPosition } from '../api/lists'
import { updateCardPosition } from '../api/cards'
import CardDetail from './CardDetail'
import CreateListForm from './CreateListForm'
import CreateCardForm from './CreateCardForm'
import Spinner from './Spinner'
import type { TaskList, CardSummary } from '../types/api'

const PRIORITY_BADGE: Record<string, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100 text-green-700',
}
const PRIORITY_LABEL: Record<string, string> = {
  high: '高', medium: '中', low: '低',
}

function calcPosition(prev: number | undefined, next: number | undefined): number {
  if (prev === undefined && next === undefined) return 1024
  if (prev === undefined) return next! / 2
  if (next === undefined) return prev + 1024
  return (prev + next) / 2
}

export default function BoardDetail() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { board, loading, error, refetch } = useBoardDetail(boardId ?? '')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListTitle, setEditingListTitle] = useState('')
  const listTitleInputRef = useRef<HTMLInputElement>(null)

  // ローカルリスト状態（楽観的更新用）
  const [localLists, setLocalLists] = useState<TaskList[]>([])
  useEffect(() => {
    if (board) setLocalLists([...board.lists].sort((a, b) => a.position - b.position))
  }, [board])

  const startEditListTitle = (listId: string, currentTitle: string) => {
    setEditingListId(listId)
    setEditingListTitle(currentTitle)
    setTimeout(() => listTitleInputRef.current?.select(), 0)
  }

  const saveListTitle = async () => {
    if (!editingListId || !editingListTitle.trim()) { setEditingListId(null); return }
    try {
      await updateList(editingListId, { title: editingListTitle.trim() })
      await refetch()
    } finally {
      setEditingListId(null)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === 'LIST') {
      // リスト並べ替え
      const newLists = [...localLists]
      const [moved] = newLists.splice(source.index, 1)
      newLists.splice(destination.index, 0, moved)
      setLocalLists(newLists)

      const prevPos = newLists[destination.index - 1]?.position
      const nextPos = newLists[destination.index + 1]?.position
      const newPosition = calcPosition(prevPos, nextPos)
      try {
        await updateListPosition(moved.id, { prevPosition: prevPos ?? null, nextPosition: nextPos ?? null })
      } catch {
        await refetch()
      }
    } else {
      // カード並べ替え / 移動
      const srcList = localLists.find(l => l.id === source.droppableId)!
      const dstList = localLists.find(l => l.id === destination.droppableId)!
      const srcCards = [...srcList.cards].sort((a, b) => a.position - b.position)
      const dstCards = source.droppableId === destination.droppableId
        ? srcCards
        : [...dstList.cards].sort((a, b) => a.position - b.position)

      const [movedCard] = srcCards.splice(source.index, 1)
      const targetCards = source.droppableId === destination.droppableId ? srcCards : dstCards
      targetCards.splice(destination.index, 0, movedCard)

      // 楽観的更新
      const newLists = localLists.map(l => {
        if (l.id === source.droppableId) return { ...l, cards: srcCards }
        if (l.id === destination.droppableId) return { ...l, cards: targetCards }
        return l
      })
      setLocalLists(newLists)

      const sortedTarget = targetCards
      const prevPos = sortedTarget[destination.index - 1]?.position
      const nextPos = sortedTarget[destination.index + 1]?.position
      try {
        await updateCardPosition(movedCard.id, {
          listId: destination.droppableId !== source.droppableId ? destination.droppableId : null,
          prevPosition: prevPos ?? null,
          nextPosition: nextPos ?? null,
        })
        await refetch()
      } catch {
        await refetch()
      }
    }
  }

  if (error) return <div className="p-8 text-red-600">エラー: {error}</div>

  if (loading && !board) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-500">
        <Spinner />
        <span>読み込み中...</span>
      </div>
    )
  }

  if (!board) return null

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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="LIST" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="relative flex-1 overflow-x-auto p-3 flex gap-3 items-start bg-blue-500/20"
            >
              {localLists.map((list, listIndex) => {
                const sortedCards = [...list.cards].sort((a, b) => a.position - b.position)
                return (
                  <Draggable key={list.id} draggableId={`list-${list.id}`} index={listIndex}>
                    {(listProvided, listSnapshot) => (
                      <div
                        ref={listProvided.innerRef}
                        {...listProvided.draggableProps}
                        className={`w-72 flex-shrink-0 bg-gray-100 rounded-md flex flex-col ${listSnapshot.isDragging ? 'shadow-2xl rotate-1' : ''}`}
                      >
                        <div
                          {...listProvided.dragHandleProps}
                          className="px-3 py-2 font-bold text-sm text-gray-700"
                        >
                          {editingListId === list.id ? (
                            <input
                              ref={listTitleInputRef}
                              value={editingListTitle}
                              onChange={e => setEditingListTitle(e.target.value)}
                              onBlur={saveListTitle}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveListTitle()
                                if (e.key === 'Escape') setEditingListId(null)
                              }}
                              onClick={e => e.stopPropagation()}
                              className="w-full font-bold text-sm bg-white border-b-2 border-blue-400 focus:outline-none px-0"
                            />
                          ) : (
                            <span
                              onDoubleClick={() => startEditListTitle(list.id, list.title)}
                              className="cursor-pointer hover:bg-gray-200 rounded px-1 -mx-1 block"
                              title="ダブルクリックして編集"
                            >
                              {list.title}
                            </span>
                          )}
                        </div>

                        <Droppable droppableId={list.id} type="CARD">
                          {(cardProvided, cardSnapshot) => (
                            <div
                              ref={cardProvided.innerRef}
                              {...cardProvided.droppableProps}
                              className={`px-2 pb-1 flex flex-col gap-1.5 min-h-[8px] ${cardSnapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                            >
                              {sortedCards.map((card, cardIndex) => (
                                <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                                  {(cardDraggable, cardDragging) => (
                                    <div
                                      ref={cardDraggable.innerRef}
                                      {...cardDraggable.draggableProps}
                                      {...cardDraggable.dragHandleProps}
                                    >
                                      <CardTile
                                        card={card}
                                        isDragging={cardDragging.isDragging}
                                        onClick={() => setSelectedCardId(card.id)}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {cardProvided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        <div className="px-2 pb-2">
                          <CreateCardForm listId={list.id} onCreated={refetch} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
              <CreateListForm boardId={board.id} onCreated={refetch} />

              {loading && (
                <div className="absolute inset-0 bg-white/30 flex items-center justify-center pointer-events-none">
                  <Spinner className="w-8 h-8" />
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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

function CardTile({ card, onClick, isDragging }: { card: CardSummary; onClick: () => void; isDragging: boolean }) {
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
      className={`bg-white rounded px-2.5 py-2 shadow-sm text-left hover:shadow-md transition w-full cursor-pointer ${isDragging ? 'shadow-xl rotate-1 opacity-90' : ''}`}
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
