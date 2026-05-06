import { Routes, Route } from 'react-router-dom'
import BoardList from './components/BoardList'
import BoardDetail from './components/BoardDetail'
import NotFoundPage from './components/NotFoundPage'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white px-4 h-12 flex items-center">
        <h1 className="font-bold text-base">TaskManagementForAI</h1>
      </header>
      <Routes>
        <Route path="/" element={<BoardList />} />
        <Route path="/boards/:boardId" element={<BoardDetail />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
