import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, parseErrorDetail } from '../api'
import './Auth.css'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!error && !success) return
    const timer = setTimeout(() => {
      setError('')
      setSuccess(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [error, success])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    try {
      const res = await apiFetch('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setSuccess(false)
        setError(parseErrorDetail(data))
      }
    } catch (err) {
      setSuccess(false)
      setError('Cannot connect to the server')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 21 12 16.5 6 21V4.6C6 3.7 6.7 3 7.6 3h8.8c.9 0 1.6.7 1.6 1.6V21Z" />
          </svg>
        </div>
        <h1>Create an account</h1>
        <p className="auth-subtitle">Start saving your bookmarks</p>

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

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

        <button type="submit">Register</button>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">Registered successfully.</p>}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
