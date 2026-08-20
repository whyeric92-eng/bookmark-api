import Register from './Register'
import Login from './Login'
import Bookmarks from './Bookmarks'
import Tags from './Tags'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App
