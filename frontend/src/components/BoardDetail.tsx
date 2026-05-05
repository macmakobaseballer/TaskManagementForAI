import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useBoardDetail } from '../hooks/useBoardDetail'
import { updateList, updateListPosition } from '../api/lists'
import { updateCardPosition } from '../api/cards'
import CardDetail from './CardDetail'
import CreateListForm from './CreateListForm'
import CreateCardForm from './CreateCardForm'
import LabelModal from './LabelModal'
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

export default function BoardDetail() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { board, loading, error, refetch } = useBoardDetail(boardId ?? '')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [showLabelManager, setShowLabelManager] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const settingsMenuRef = useRef<HTMLDivElement>(null)
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListTitle, setEditingListTitle] = useState('')
  const listTitleInputRef = useRef<HTMLInputElement>(null)

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

  // ローカルリスト状態（楽観的更新用）
  // ※ position ソートはここだけで行い、レンダー時は再ソートしない
  const [localLists, setLocalLists] = useState<TaskList[]>([])
  useEffect(() => {
    if (board) {
      setLocalLists(
        [...board.lists]
          .sort((a, b) => a.position - b.position)
          .map(l => ({ ...l, cards: [...l.cards].sort((a, b) => a.position - b.position) }))
      )
    }
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
      const newLists = [...localLists]
      const [moved] = newLists.splice(source.index, 1)
      newLists.splice(destination.index, 0, moved)
      setLocalLists(newLists)

      const prevPos = newLists[destination.index - 1]?.position
      const nextPos = newLists[destination.index + 1]?.position
      try {
        await updateListPosition(moved.id, { prevPosition: prevPos ?? null, nextPosition: nextPos ?? null })
      } catch {
        // 失敗時はサーバーデータに戻す
      } finally {
        await refetch()
      }
    } else {
      // カード並べ替え / リスト間移動
      const srcListIdx = localLists.findIndex(l => l.id === source.droppableId)
      const dstListIdx = localLists.findIndex(l => l.id === destination.droppableId)
      if (srcListIdx === -1 || dstListIdx === -1) return

      const newLists = localLists.map(l => ({ ...l, cards: [...l.cards] }))
      const srcCards = newLists[srcListIdx].cards
      const dstCards = newLists[dstListIdx].cards

      const [movedCard] = srcCards.splice(source.index, 1)

      if (srcListIdx === dstListIdx) {
        srcCards.splice(destination.index, 0, movedCard)
      } else {
        dstCards.splice(destination.index, 0, movedCard)
      }

      setLocalLists(newLists)

      const targetCards = srcListIdx === dstListIdx ? srcCards : dstCards
      const prevPos = targetCards[destination.index - 1]?.position
      const nextPos = targetCards[destination.index + 1]?.position
      try {
        await updateCardPosition(movedCard.id, {
          listId: dstListIdx !== srcListIdx ? destination.droppableId : null,
          prevPosition: prevPos ?? null,
          nextPosition: nextPos ?? null,
        })
      } catch {
        // 失敗時はサーバーデータに戻す
      } finally {
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
        <div className="relative ml-auto" ref={settingsMenuRef}>
          <button
            onClick={() => setShowSettingsMenu(v => !v)}
            className="p-1.5 rounded bg-white/20 hover:bg-white/30 cursor-pointer"
            title="設定"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
          {showSettingsMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => { setShowSettingsMenu(false); setShowLabelManager(true) }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                ラベル管理
              </button>
            </div>
          )}
        </div>
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
              {localLists.map((list, listIndex) => (
                <Draggable key={list.id} draggableId={`list-${list.id}`} index={listIndex}>
                  {(listProvided, listSnapshot) => (
                    <div
                      ref={listProvided.innerRef}
                      {...listProvided.draggableProps}
                      className={`w-72 flex-shrink-0 bg-gray-100 rounded-md flex flex-col ${listSnapshot.isDragging ? 'shadow-2xl rotate-1' : ''}`}
                    >
                      {/* リストヘッダー（全体がドラッグハンドル） */}
                      <div
                        {...listProvided.dragHandleProps}
                        className="px-3 py-2 font-bold text-sm text-gray-700 flex items-center gap-1 cursor-grab active:cursor-grabbing"
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
                            className="flex-1 font-bold text-sm bg-white border-b-2 border-blue-400 focus:outline-none"
                          />
                        ) : (
                          <span
                            onDoubleClick={() => startEditListTitle(list.id, list.title)}
                            className="flex-1 cursor-pointer hover:bg-gray-200 rounded px-1"
                            title="ダブルクリックして編集"
                          >
                            {list.title}
                          </span>
                        )}
                      </div>

                      {/* カード一覧 */}
                      <Droppable droppableId={list.id} type="CARD">
                        {(cardProvided, cardSnapshot) => (
                          <div
                            ref={cardProvided.innerRef}
                            {...cardProvided.droppableProps}
                            className={`px-2 pb-1 flex flex-col gap-1.5 min-h-[8px] transition-colors ${cardSnapshot.isDraggingOver ? 'bg-blue-50 rounded' : ''}`}
                          >
                            {/* ※ ソートしない – localLists のインデックス順をそのまま使う */}
                            {list.cards.map((card, cardIndex) => (
                              <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                                {(cardDraggable, cardDragging) => (
                                  <div
                                    ref={cardDraggable.innerRef}
                                    {...cardDraggable.draggableProps}
                                    {...cardDraggable.dragHandleProps}
                                    onClick={() => setSelectedCardId(card.id)}
                                    className={`cursor-pointer ${cardDragging.isDragging ? 'shadow-xl rotate-1 opacity-90' : ''}`}
                                  >
                                    <CardTile card={card} />
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
              ))}
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
          onSaved={refetch}
        />
      )}

      {showLabelManager && (
        <LabelModal
          boardId={board.id}
          onClose={() => setShowLabelManager(false)}
          onLabelsChanged={refetch}
        />
      )}
    </div>
  )
}

function CardTile({ card }: { card: CardSummary }) {
  const today = new Date().toISOString().slice(0, 10)
  const dueCls = !card.dueDate
    ? ''
    : card.dueDate < today
      ? 'text-red-600 font-semibold'
      : card.dueDate === today
        ? 'text-orange-500 font-semibold'
        : 'text-gray-500'

  return (
    <div className="bg-white rounded px-2.5 py-2 shadow-sm hover:shadow-md transition w-full">
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
    </div>
  )
}
