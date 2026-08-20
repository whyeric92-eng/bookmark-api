import { useState, useEffect } from "react"
import { apiFetch } from './api'
import './Bookmarks.css'

function Bookmarks() {
    const [bookmarks, setBookmarks] = useState([])
    const [error, setError] = useState()
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [notes, setNotes] = useState('')
    const [success, setSuccess] = useState(false)
    const [formError, setFormError] = useState('')

    async function get_bookmarks() {
        try {
            const res = await apiFetch('/bookmarks', {
                method: 'GET',
            })
            const data = await res.json()

            if (res.ok) {
                setBookmarks(data)
            } else {
                setError('Unknown Error')
            }
        } catch(err) {
            setError('Cannot connect to the server')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        get_bookmarks()
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        setSuccess(false)
        try {
            const res = await apiFetch('/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, url, notes })
            })
            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setTitle('')
                setUrl('')
                setNotes('')
                get_bookmarks()
            } else {
                setSuccess(false)
                if (Array.isArray(data.detail)) {
                    setFormError(data.detail.map((item) => item.msg).join(', '))
                } else {
                    setFormError(data.detail)
                }
            }
        } catch(err) {
            setFormError("Cannot connect to the server")
        }
    }

    if (loading) {
        return <p className="bookmarks-status">Loading...</p>
    }

    if (error) {
        return <p className="bookmarks-status form-error">{error}</p>
    }

    return (
        <div className="bookmarks-page">
            <h1>Bookmarks</h1>

            <form className="bookmark-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <button type="submit">Add bookmark</button>

                {formError && <p className="form-error">{formError}</p>}
                {success && <p className="form-success">Added.</p>}
            </form>

            {bookmarks.length === 0 ? (
                <p className="bookmarks-status">No bookmarks yet.</p>
            ) : (
                <ul className="bookmarks-list">
                    {bookmarks.map((bookmark) => (
                        <li key={bookmark.bookmark_id} className="bookmark-card">
                            <a href={bookmark.url} target="_blank" rel="noreferrer" className="bookmark-title">
                                {bookmark.title}
                            </a>
                            <p className="bookmark-url">{bookmark.url}</p>
                            {bookmark.notes && <p className="bookmark-notes">{bookmark.notes}</p>}
                            {bookmark.tags && bookmark.tags.length > 0 && (
                                <div className="bookmark-tags">
                                    {bookmark.tags.map((tag) => (
                                        <span key={tag.tag_id} className="bookmark-tag">{tag.tag}</span>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Bookmarks