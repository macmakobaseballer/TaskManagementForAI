import { useState, useReducer } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useBoardDetail } from '../hooks/useBoardDetail'
import { updateList, updateListPosition, deleteList } from '../api/lists'
import { updateCardPosition } from '../api/cards'
import { deleteBoard } from '../api/boards'
import CardDetail from './CardDetail'
import CreateListForm from './CreateListForm'
import LabelModal from './LabelModal'
import ConfirmDialog from './ConfirmDialog'
import NotFoundPage from './NotFoundPage'
import Spinner from './Spinner'
import BoardHeader from './board/BoardHeader'
import BoardListColumn from './board/BoardListColumn'
import { boardDetailReducer, initialBoardDetailState } from './board/boardDetailReducer'
import type { TaskList } from '../types/api'

export default function BoardDetail() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { board, loading, error, isNotFound, refetch } = useBoardDetail(boardId ?? '')

  const [state, dispatch] = useReducer(boardDetailReducer, initialBoardDetailState)
  const {
    editingListId, editingListTitle,
    confirmDeleteListId, deletingListId,
    confirmDeleteBoard, deletingBoard,
  } = state

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [showLabelManager, setShowLabelManager] = useState(false)

  // board が変化したらソート済みリストを同期（render during render パターン）
  const [localLists, setLocalLists] = useState<TaskList[]>([])
  const [prevBoard, setPrevBoard] = useState(board)
  if (prevBoard !== board) {
    setPrevBoard(board)
    if (board) {
      setLocalLists(
        [...board.lists]
          .sort((a, b) => a.position - b.position)
          .map(l => ({ ...l, cards: [...l.cards].sort((a, b) => a.position - b.position) }))
      )
    }
  }

  const saveListTitle = async () => {
    if (!editingListId || !editingListTitle.trim()) { dispatch({ type: 'CANCEL_EDIT_LIST' }); return }
    try {
      await updateList(editingListId, { title: editingListTitle.trim() })
      await refetch()
    } finally {
      dispatch({ type: 'SAVE_EDIT_LIST' })
    }
  }

  const handleDeleteList = async () => {
    if (!confirmDeleteListId) return
    dispatch({ type: 'START_DELETE_LIST' })
    try {
      await deleteList(confirmDeleteListId)
      await refetch()
    } finally {
      dispatch({ type: 'FINISH_DELETE_LIST' })
    }
  }

  const handleDeleteBoard = async () => {
    if (!boardId) return
    dispatch({ type: 'START_DELETE_BOARD' })
    try {
      await deleteBoard(boardId)
      navigate('/')
    } finally {
      dispatch({ type: 'FINISH_DELETE_BOARD' })
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

  if (isNotFound) {
    return (
      <NotFoundPage
        title="ボードが見つかりません"
        message="このボードは削除されたか、URLが正しくない可能性があります。"
        backLabel="ボード一覧へ戻る"
      />
    )
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
      <BoardHeader
        title={board.title}
        loading={loading}
        onNavigateBack={() => navigate('/')}
        onOpenLabelManager={() => setShowLabelManager(true)}
        onOpenDeleteBoard={() => dispatch({ type: 'OPEN_DELETE_BOARD' })}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="LIST" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="relative flex-1 overflow-x-auto p-3 flex gap-3 items-start bg-blue-500/20"
            >
              {localLists.map((list, listIndex) => (
                <BoardListColumn
                  key={list.id}
                  list={list}
                  index={listIndex}
                  editingListId={editingListId}
                  editingListTitle={editingListTitle}
                  onStartEditTitle={(listId, currentTitle) =>
                    dispatch({ type: 'START_EDIT_LIST', listId, currentTitle })
                  }
                  onChangeTitle={title => dispatch({ type: 'CHANGE_LIST_TITLE', title })}
                  onSaveTitle={saveListTitle}
                  onCancelEditTitle={() => dispatch({ type: 'CANCEL_EDIT_LIST' })}
                  onConfirmDeleteList={listId => dispatch({ type: 'CONFIRM_DELETE_LIST', listId })}
                  onSelectCard={setSelectedCardId}
                  onCardCreated={refetch}
                />
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

      <ConfirmDialog
        isOpen={!!confirmDeleteListId}
        title="リストを削除"
        message={`「${localLists.find(l => l.id === confirmDeleteListId)?.title}」を削除しますか？リスト内のカードもすべて削除されます。`}
        confirming={!!deletingListId}
        onConfirm={handleDeleteList}
        onClose={() => dispatch({ type: 'CANCEL_DELETE_LIST' })}
      />

      <ConfirmDialog
        isOpen={confirmDeleteBoard}
        title="ボードを削除"
        message={`「${board.title}」を削除しますか？ボード内のすべてのリストとカードが削除されます。`}
        confirming={deletingBoard}
        onConfirm={handleDeleteBoard}
        onClose={() => dispatch({ type: 'CANCEL_DELETE_BOARD' })}
      />
    </div>
  )
}
