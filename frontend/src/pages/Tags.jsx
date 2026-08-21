import { useState, useEffect } from 'react'
import { apiFetch, parseErrorDetail } from '../api'
import NavBar from '../components/NavBar'
import ConfirmModal from '../components/ConfirmModal'
import './Tags.css'

function Tags() {
    const [tags, setTags] = useState([])
    const [error, setError] = useState()
    const [loading, setLoading] = useState(true)

    const [tag, setTag] = useState('')
    const [success, setSuccess] = useState(false)
    const [formError, setFormError] = useState('')

    const [editingId, setEditingId] = useState(null)
    const [editTag, setEditTag] = useState('')
    const [editError, setEditError] = useState('')

    const [deleteTarget, setDeleteTarget] = useState(null)

    async function get_tags() {
        try {
            const res = await apiFetch('/tags', {
                method: 'GET',
            })
            const data = await res.json()

            if (res.ok) {
                setTags(data)
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
        get_tags()
    }, [])

    useEffect(() => {
        if (!success && !formError) return
        const timer = setTimeout(() => {
            setSuccess(false)
            setFormError('')
        }, 3000)
        return () => clearTimeout(timer)
    }, [success, formError])

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        setSuccess(false)
        try {
            const res = await apiFetch('/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag })
            })
            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setTag('')
                get_tags()
            } else {
                setSuccess(false)
                setFormError(parseErrorDetail(data))
            }
        } catch (err) {
            setFormError('Cannot connect to the server')
        }
    }

    function handleDeleteClick(t) {
        setDeleteTarget(t)
    }

    async function handleDeleteConfirm() {
        const tagId = deleteTarget.tag_id
        setDeleteTarget(null)
        try {
            const res = await apiFetch('/tags/' + tagId, {
                method: 'DELETE',
            })

            if (res.ok) {
                get_tags()
            } else {
                setFormError('Failed to delete tag')
            }
        } catch (err) {
            setFormError('Cannot connect to the server')
        }
    }

    function handleEditClick(t) {
        setEditingId(t.tag_id)
        setEditTag(t.tag)
        setEditError('')
    }

    function handleCancelEdit() {
        setEditingId(null)
    }

    async function handleEditSubmit(e, tagId) {
        e.preventDefault()
        setEditError('')
        try {
            const res = await apiFetch('/tags/' + tagId, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag: editTag })
            })
            const data = await res.json()

            if (res.ok) {
                setEditingId(null)
                get_tags()
            } else {
                setEditError(parseErrorDetail(data))
            }
        } catch (err) {
            setEditError('Cannot connect to the server')
        }
    }

    if (loading) {
        return (
            <>
                <NavBar />
                <p className="tags-status">Loading...</p>
            </>
        )
    }

    if (error) {
        return (
            <>
                <NavBar />
                <p className="tags-status form-error">{error}</p>
            </>
        )
    }

    return (
        <>
            <NavBar />
            <div className="tags-page">
            <h1>Tags</h1>

            <form className="tag-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="New tag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                />
                <button type="submit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add tag
                </button>

                {formError && <p className="form-error">{formError}</p>}
                {success && <p className="form-success">Added.</p>}
            </form>

            {tags.length === 0 ? (
                <p className="tags-status">No tags yet.</p>
            ) : (
                <ul className="tags-list">
                    {tags.map((t) => (
                        <li key={t.tag_id} className="tag-card">
                            {editingId === t.tag_id ? (
                                <form
                                    className="tag-edit-form"
                                    onSubmit={(e) => handleEditSubmit(e, t.tag_id)}
                                >
                                    <input
                                        type="text"
                                        value={editTag}
                                        onChange={(e) => setEditTag(e.target.value)}
                                    />
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={handleCancelEdit}>Cancel</button>
                                    {editError && <p className="form-error">{editError}</p>}
                                </form>
                            ) : (
                                <>
                                    <div className="tag-name-group">
                                        <div className="tag-icon">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2H3v9l9.3 9.3a2 2 0 0 0 2.8 0l6.2-6.2a2 2 0 0 0 0-2.8L12 2Z" />
                                                <circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
                                            </svg>
                                        </div>
                                        <span className="tag-name">{t.tag}</span>
                                    </div>
                                    <div className="tag-actions">
                                        <button
                                            type="button"
                                            className="tag-edit"
                                            onClick={() => handleEditClick(t)}
                                            aria-label="Edit tag"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="tag-delete"
                                            onClick={() => handleDeleteClick(t)}
                                            aria-label="Delete tag"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" />
                                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                            </svg>
                                        </button>
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
                title="Delete tag?"
                message={deleteTarget ? `"${deleteTarget.tag}" will be removed from any bookmarks it's on.` : ''}
                confirmLabel="Delete"
                danger
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}

export default Tags
