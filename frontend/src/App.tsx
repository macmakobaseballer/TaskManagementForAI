import { useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import BoardList from './components/BoardList'
import BoardDetail from './components/BoardDetail'
import NotFoundPage from './components/NotFoundPage'

// ブラウザセッション内で同じ風景画像を維持（Picsum Photos）
function useBackgroundImage() {
  return useMemo(() => {
    const KEY = 'bg_seed'
    let seed = sessionStorage.getItem(KEY)
    if (!seed) {
      seed = String(Math.floor(Math.random() * 500) + 1)
      sessionStorage.setItem(KEY, seed)
    }
    return `https://picsum.photos/seed/${seed}/1920/1080`
  }, [])
}

export default function App() {
  const bgImage = useBackgroundImage()

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <header className="bg-blue-700/85 backdrop-blur-sm text-white px-4 h-12 flex items-center shadow-md">
        <h1 className="font-bold text-base flex items-center gap-2">
          {/* カンバンボードアイコン */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
          TrelloFU
        </h1>
      </header>
      <div className="bg-black/25 min-h-[calc(100vh-48px)]">
        <Routes>
          <Route path="/" element={<BoardList />} />
          <Route path="/boards/:boardId" element={<BoardDetail />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  )
}
