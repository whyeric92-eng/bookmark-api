import { useState } from 'react'
import './App.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)


  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    try {
      const res = await fetch ('http://127.0.0.1:8001/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        localStorage.setItem('token', data.access_token)
      } else {
        setSuccess(false)
        if (Array.isArray(data.detail)) {
          setError(data.detail.map((item) => item.msg).join(', '))
        } else {
          setError(data.detail)
        }
      }
    } catch(err) {
      setSuccess(false)
      setError('Cannot connect to the server')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit">Login</button>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">Logged in successfully.</p>}
      </form>
    </div>
  )
}

export default Login
