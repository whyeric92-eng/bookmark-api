import { useState, useEffect } from 'react'
import { apiFetch } from './api'
import NavBar from './NavBar'
import './Profile.css'

function Profile() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [error, setError] = useState()
    const [loading, setLoading] = useState(true)

    const [editing, setEditing] = useState(false)
    const [editUsername, setEditUsername] = useState('')
    const [editEmail, setEditEmail] = useState('')
    const [formError, setFormError] = useState('')
    const [success, setSuccess] = useState(false)

    async function get_profile() {
        try {
            const res = await apiFetch('/users/profile', { method: 'GET' })
            const data = await res.json()

            if (res.ok) {
                setUsername(data.username)
                setEmail(data.email)
            } else {
                setError('Unknown Error')
            }
        } catch (err) {
            setError('Cannot connect to the server')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        get_profile()
    }, [])

    function handleEditClick() {
        setEditUsername(username)
        setEditEmail(email)
        setFormError('')
        setSuccess(false)
        setEditing(true)
    }

    function handleCancelEdit() {
        setEditing(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        setSuccess(false)
        try {
            const res = await apiFetch('/users/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: editUsername, email: editEmail })
            })
            const data = await res.json()

            if (res.ok) {
                setUsername(data.username)
                setEmail(data.email)
                setEditing(false)
                setSuccess(true)
            } else {
                if (Array.isArray(data.detail)) {
                    setFormError(data.detail.map((item) => item.msg).join(', '))
                } else {
                    setFormError(data.detail)
                }
            }
        } catch (err) {
            setFormError('Cannot connect to the server')
        }
    }

    return (
        <>
            <NavBar />
            <div className="profile-page">
                <h1>Profile</h1>

                {loading ? (
                    <p className="profile-status">Loading...</p>
                ) : error ? (
                    <p className="profile-status form-error">{error}</p>
                ) : editing ? (
                    <form className="profile-form" onSubmit={handleSubmit}>
                        <label>
                            Username
                            <input
                                type="text"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                            />
                        </label>
                        <label>
                            Email
                            <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                            />
                        </label>
                        <div className="profile-actions">
                            <button type="submit">Save</button>
                            <button type="button" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                        {formError && <p className="form-error">{formError}</p>}
                    </form>
                ) : (
                    <div className="profile-view">
                        <p><span className="profile-label">Username</span>{username}</p>
                        <p><span className="profile-label">Email</span>{email}</p>
                        <button type="button" onClick={handleEditClick}>Edit</button>
                        {success && <p className="form-success">Updated.</p>}
                    </div>
                )}
            </div>
        </>
    )
}

export default Profile
