import { useState, useEffect } from 'react'
import { apiFetch, parseErrorDetail } from '../api'
import NavBar from '../components/NavBar'
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

    async function handleDelete(tagId) {
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
                <button type="submit">Add tag</button>

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
                                    <span className="tag-name">{t.tag}</span>
                                    <div className="tag-actions">
                                        <button
                                            type="button"
                                            className="tag-edit"
                                            onClick={() => handleEditClick(t)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="tag-delete"
                                            onClick={() => handleDelete(t.tag_id)}
                                        >
                                            Delete
                                        </button>
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

export default Tags
