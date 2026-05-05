import { useRef } from 'react'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import CreateCardForm from '../CreateCardForm'
import type { TaskList, CardSummary } from '../../types/api'

const PRIORITY_BADGE: Record<string, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100 text-green-700',
}
const PRIORITY_LABEL: Record<string, string> = {
  high: '高', medium: '中', low: '低',
}

interface Props {
  list: TaskList
  index: number
  editingListId: string | null
  editingListTitle: string
  onStartEditTitle: (listId: string, currentTitle: string) => void
  onChangeTitle: (title: string) => void
  onSaveTitle: () => void
  onCancelEditTitle: () => void
  onConfirmDeleteList: (listId: string) => void
  onSelectCard: (cardId: string) => void
  onCardCreated: () => void
}

export default function BoardListColumn({
  list, index,
  editingListId, editingListTitle,
  onStartEditTitle, onChangeTitle, onSaveTitle, onCancelEditTitle,
  onConfirmDeleteList, onSelectCard, onCardCreated,
}: Props) {
  const listTitleInputRef = useRef<HTMLInputElement>(null)

  const startEdit = (listId: string, currentTitle: string) => {
    onStartEditTitle(listId, currentTitle)
    setTimeout(() => listTitleInputRef.current?.select(), 0)
  }

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(listProvided, listSnapshot) => (
        <div
          ref={listProvided.innerRef}
          {...listProvided.draggableProps}
          className={`w-72 flex-shrink-0 bg-gray-100 rounded-md flex flex-col ${listSnapshot.isDragging ? 'shadow-2xl rotate-1' : ''}`}
        >
          {/* リストヘッダー（全体がドラッグハンドル） */}
          <div
            {...listProvided.dragHandleProps}
            className="px-3 py-2 font-bold text-sm text-gray-700 flex items-center gap-1 cursor-grab active:cursor-grabbing group"
          >
            {editingListId === list.id ? (
              <input
                ref={listTitleInputRef}
                value={editingListTitle}
                onChange={e => onChangeTitle(e.target.value)}
                onBlur={onSaveTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') onSaveTitle()
                  if (e.key === 'Escape') onCancelEditTitle()
                }}
                className="flex-1 font-bold text-sm bg-white border-b-2 border-blue-400 focus:outline-none"
              />
            ) : (
              <span
                onDoubleClick={() => startEdit(list.id, list.title)}
                className="flex-1 cursor-pointer hover:bg-gray-200 rounded px-1"
                title="ダブルクリックして編集"
              >
                {list.title}
              </span>
            )}
            <button
              onClick={e => { e.stopPropagation(); onConfirmDeleteList(list.id) }}
              onMouseDown={e => e.stopPropagation()}
              className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition cursor-pointer flex-shrink-0"
              title="リストを削除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* カード一覧 */}
          <Droppable droppableId={list.id} type="CARD">
            {(cardProvided, cardSnapshot) => (
              <div
                ref={cardProvided.innerRef}
                {...cardProvided.droppableProps}
                className={`px-2 pb-1 flex flex-col gap-1.5 min-h-[8px] transition-colors ${cardSnapshot.isDraggingOver ? 'bg-blue-50 rounded' : ''}`}
              >
                {list.cards.map((card, cardIndex) => (
                  <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                    {(cardDraggable, cardDragging) => (
                      <div
                        ref={cardDraggable.innerRef}
                        {...cardDraggable.draggableProps}
                        {...cardDraggable.dragHandleProps}
                        onClick={() => onSelectCard(card.id)}
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
            <CreateCardForm listId={list.id} onCreated={onCardCreated} />
          </div>
        </div>
      )}
    </Draggable>
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
