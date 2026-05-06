import { useNavigate } from 'react-router-dom'

interface Props {
  title?: string
  message?: string
  backTo?: string
  backLabel?: string
}

export default function NotFoundPage({
  title = 'ページが見つかりません',
  message = '削除されたか、URLが正しくない可能性があります。',
  backTo = '/',
  backLabel = 'トップへ戻る',
}: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] text-center p-8">
      <div className="text-6xl mb-6">🗂️</div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">{title}</h2>
      <p className="text-sm text-gray-400 mb-6">{message}</p>
      <button
        onClick={() => navigate(backTo)}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
      >
        ← {backLabel}
      </button>
    </div>
  )
}
