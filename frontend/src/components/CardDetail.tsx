import { useCardDetail } from '../hooks/useCardDetail'

interface Props {
  cardId: string
  onClose: () => void
}

export default function CardDetail({ cardId, onClose }: Props) {
  const { card, loading, error } = useCardDetail(cardId)

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-12 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl leading-none px-2 cursor-pointer"
        >
          ×
        </button>

        {loading && <p className="text-gray-500">読み込み中...</p>}
        {error && <p className="text-red-600">エラー: {error}</p>}
        {card && (
          <>
            <h2 className="text-lg font-bold mb-4 pr-8">{card.title}</h2>

            {card.labels.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">ラベル</div>
                <div className="flex flex-wrap gap-1.5">
                  {card.labels.map(l => (
                    <span
                      key={l.id}
                      className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: l.color }}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {card.description && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">説明</div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{card.description}</p>
              </div>
            )}

            {card.checklists.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-2">チェックリスト</div>
                {[...card.checklists]
                  .sort((a, b) => a.position - b.position)
                  .map(cl => {
                    const done = cl.items.filter(i => i.isCompleted).length
                    const total = cl.items.length
                    const pct = total ? Math.round((done / total) * 100) : 0
                    return (
                      <div key={cl.id} className="mb-3">
                        <div className="flex justify-between text-sm font-semibold mb-1">
                          <span>{cl.title}</span>
                          <span className="text-gray-400 text-xs">{done}/{total} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded mb-2 overflow-hidden">
                          <div
                            className={`h-full rounded transition-all ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {[...cl.items]
                          .sort((a, b) => a.position - b.position)
                          .map(item => (
                            <div key={item.id} className="flex items-center gap-2 py-0.5">
                              <input
                                type="checkbox"
                                checked={item.isCompleted}
                                readOnly
                                className="cursor-default"
                              />
                              <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                      </div>
                    )
                  })}
              </div>
            )}

            <div className="border-t pt-3 text-xs text-gray-400 flex gap-4">
              <span>優先度: {card.priority}</span>
              {card.dueDate && <span>期日: {card.dueDate}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
