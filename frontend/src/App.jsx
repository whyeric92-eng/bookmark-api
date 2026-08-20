import Register from './Register'
import Login from './Login'
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
            <div>Home placeholder</div>
          </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
