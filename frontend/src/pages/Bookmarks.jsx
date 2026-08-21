import { useState, useEffect } from "react"
import { apiFetch, parseErrorDetail } from '../api'
import NavBar from '../components/NavBar'
import ConfirmModal from '../components/ConfirmModal'
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

    const [deleteTarget, setDeleteTarget] = useState(null)

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

    useEffect(() => {
        if (!success && !formError) return
        const timer = setTimeout(() => {
            setSuccess(false)
            setFormError('')
        }, 3000)
        return () => clearTimeout(timer)
    }, [success, formError])

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
                setFormError(parseErrorDetail(data))
            }
        } catch(err) {
            setFormError("Cannot connect to the server")
        }
    }

    function handleDeleteClick(bookmark) {
        setDeleteTarget(bookmark)
    }

    async function handleDeleteConfirm() {
        const bookmarkId = deleteTarget.bookmark_id
        setDeleteTarget(null)
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
                setEditError(parseErrorDetail(data))
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
                setFormError(parseErrorDetail(data))
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
                <div className="bookmark-search-input">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search title, url, or notes"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
                <button type="submit">Search</button>
            </form>

            <form className="bookmark-form" onSubmit={handleSubmit}>
                <div className="bookmark-form-label">Add a bookmark</div>
                <div className="bookmark-form-row">
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
                </div>
                <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <button type="submit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add bookmark
                </button>

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
                                        <div className="bookmark-card-heading">
                                            <div className="bookmark-favicon">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="9" />
                                                    <line x1="3" y1="12" x2="21" y2="12" />
                                                    <path d="M12 3c2.4 2.4 3.6 5.8 3.6 9s-1.2 6.6-3.6 9c-2.4-2.4-3.6-5.8-3.6-9S9.6 5.4 12 3Z" />
                                                </svg>
                                            </div>
                                            <div className="bookmark-card-text">
                                                <span className="bookmark-title">{bookmark.title}</span>
                                                <a href={bookmark.url} target="_blank" rel="noreferrer" className="bookmark-url">
                                                    {bookmark.url}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="bookmark-actions">
                                            <button
                                                type="button"
                                                className="bookmark-edit"
                                                onClick={() => handleEditClick(bookmark)}
                                                aria-label="Edit bookmark"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                className="bookmark-delete"
                                                onClick={() => handleDeleteClick(bookmark)}
                                                aria-label="Delete bookmark"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18" />
                                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
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
            <ConfirmModal
                open={!!deleteTarget}
                title="Delete bookmark?"
                message={deleteTarget ? `"${deleteTarget.title}" will be permanently removed.` : ''}
                confirmLabel="Delete"
                danger
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}

export default Bookmarks
