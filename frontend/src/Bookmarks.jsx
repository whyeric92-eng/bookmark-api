import { useState, useEffect } from "react"
import { apiFetch } from './api'
import NavBar from './NavBar'
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

    const [editingId, setEditingId] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [editUrl, setEditUrl] = useState('')
    const [editNotes, setEditNotes] = useState('')
    const [editError, setEditError] = useState('')

    const [q, setQ] = useState('')

    const [allTags, setAllTags] = useState([])

    async function get_tags() {
        try {
            const res = await apiFetch('/tags', { method: 'GET' })
            const data = await res.json()
            if (res.ok) {
                setAllTags(data)
            }
        } catch (err) {
            // tag dropdown just stays empty if this fails, not worth blocking the page over
        }
    }

    useEffect(() => {
        get_tags()
    }, [])

    async function get_bookmarks(searchQuery) {
        try {
            const url = searchQuery
                ? '/bookmarks?q=' + encodeURIComponent(searchQuery)
                : '/bookmarks'
            const res = await apiFetch(url, {
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

    function handleSearch(e) {
        e.preventDefault()
        setLoading(true)
        get_bookmarks(q)
    }

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
                get_bookmarks(q)
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

    async function handleDelete(bookmarkId) {
        try {
            const res = await apiFetch('/bookmarks/' + bookmarkId, {
                method: 'DELETE',
            })

            if (res.ok) {
                get_bookmarks(q)
            } else {
                setFormError('Failed to delete bookmark')
            }
        } catch (err) {
            setFormError('Cannot connect to the server')
        }
    }

    function handleEditClick(bookmark) {
        setEditingId(bookmark.bookmark_id)
        setEditTitle(bookmark.title)
        setEditUrl(bookmark.url)
        setEditNotes(bookmark.notes || '')
        setEditError('')
    }

    function handleCancelEdit() {
        setEditingId(null)
    }

    async function handleEditSubmit(e, bookmarkId) {
        e.preventDefault()
        setEditError('')
        try {
            const res = await apiFetch('/bookmarks/' + bookmarkId, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle, url: editUrl, notes: editNotes })
            })
            const data = await res.json()

            if (res.ok) {
                setEditingId(null)
                get_bookmarks(q)
            } else {
                if (Array.isArray(data.detail)) {
                    setEditError(data.detail.map((item) => item.msg).join(', '))
                } else {
                    setEditError(data.detail)
                }
            }
        } catch (err) {
            setEditError('Cannot connect to the server')
        }
    }

    async function handleAttachTag(bookmarkId, tagId) {
        try {
            const res = await apiFetch('/bookmarks/' + bookmarkId + '/tags/' + tagId, {
                method: 'POST',
            })
            if (res.ok) {
                get_bookmarks(q)
            } else {
                const data = await res.json()
                setFormError(Array.isArray(data.detail) ? data.detail.map((item) => item.msg).join(', ') : data.detail)
            }
        } catch (err) {
            setFormError('Cannot connect to the server')
        }
    }

    async function handleDetachTag(bookmarkId, tagId) {
        try {
            const res = await apiFetch('/bookmarks/' + bookmarkId + '/tags/' + tagId, {
                method: 'DELETE',
            })
            if (res.ok) {
                get_bookmarks(q)
            } else {
                setFormError('Failed to remove tag')
            }
        } catch (err) {
            setFormError('Cannot connect to the server')
        }
    }

    if (loading) {
        return (
            <>
                <NavBar />
                <p className="bookmarks-status">Loading...</p>
            </>
        )
    }

    if (error) {
        return (
            <>
                <NavBar />
                <p className="bookmarks-status form-error">{error}</p>
            </>
        )
    }

    return (
        <>
            <NavBar />
            <div className="bookmarks-page">
                <h1>Bookmarks</h1>

            <form className="bookmark-search" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search title, url, or notes"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

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
                            {editingId === bookmark.bookmark_id ? (
                                <form
                                    className="bookmark-edit-form"
                                    onSubmit={(e) => handleEditSubmit(e, bookmark.bookmark_id)}
                                >
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                    />
                                    <input
                                        type="url"
                                        value={editUrl}
                                        onChange={(e) => setEditUrl(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                    />
                                    <div className="bookmark-edit-actions">
                                        <button type="submit">Save</button>
                                        <button type="button" onClick={handleCancelEdit}>Cancel</button>
                                    </div>
                                    {editError && <p className="form-error">{editError}</p>}
                                </form>
                            ) : (
                                <>
                                    <div className="bookmark-card-header">
                                        <a href={bookmark.url} target="_blank" rel="noreferrer" className="bookmark-title">
                                            {bookmark.title}
                                        </a>
                                        <div className="bookmark-actions">
                                            <button
                                                type="button"
                                                className="bookmark-edit"
                                                onClick={() => handleEditClick(bookmark)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="bookmark-delete"
                                                onClick={() => handleDelete(bookmark.bookmark_id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p className="bookmark-url">{bookmark.url}</p>
                                    {bookmark.notes && <p className="bookmark-notes">{bookmark.notes}</p>}

                                    <div className="bookmark-tags">
                                        {bookmark.tags && bookmark.tags.map((tag) => (
                                            <span key={tag.tag_id} className="bookmark-tag">
                                                {tag.tag}
                                                <button
                                                    type="button"
                                                    className="bookmark-tag-remove"
                                                    onClick={() => handleDetachTag(bookmark.bookmark_id, tag.tag_id)}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}

                                        {allTags.filter((t) => !bookmark.tags?.some((bt) => bt.tag_id === t.tag_id)).length > 0 && (
                                            <select
                                                className="bookmark-tag-select"
                                                value=""
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleAttachTag(bookmark.bookmark_id, e.target.value)
                                                    }
                                                }}
                                            >
                                                <option value="">+ Add tag</option>
                                                {allTags
                                                    .filter((t) => !bookmark.tags?.some((bt) => bt.tag_id === t.tag_id))
                                                    .map((t) => (
                                                        <option key={t.tag_id} value={t.tag_id}>{t.tag}</option>
                                                    ))}
                                            </select>
                                        )}
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            </div>
        </>
    )
}

export default Bookmarks