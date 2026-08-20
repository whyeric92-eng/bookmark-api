import { useState, useEffect } from "react"
import { apiFetch } from './api'
import './Bookmarks.css'

function Bookmarks() {
    const [bookmarks, setBookmarks] = useState([])
    const [error, setError] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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

        get_bookmarks()

    }, [])

    if (loading) {
        return <p className="bookmarks-status">Loading...</p>
    }

    if (error) {
        return <p className="bookmarks-status form-error">{error}</p>
    }

    return (
        <div className="bookmarks-page">
            <h1>Bookmarks</h1>

            {bookmarks.length === 0 ? (
                <p className="bookmarks-status">No bookmarks yet.</p>
            ) : (
                <ul className="bookmarks-list">
                    {bookmarks.map((bookmark) => (
                        <li key={bookmark.bookmark_id} className="bookmark-card">
                            <a href={bookmark.url} target="_blank" rel="noreferrer" className="bookmark-title">
                                {bookmark.title}
                            </a>
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