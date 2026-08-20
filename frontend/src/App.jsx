import Register from './pages/Register'
import Login from './pages/Login'
import Bookmarks from './pages/Bookmarks'
import Tags from './pages/Tags'
import Profile from './pages/Profile'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>} />
        <Route path="/tags" element={
          <ProtectedRoute>
            <Tags />
          </ProtectedRoute>} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
