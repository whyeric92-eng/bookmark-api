import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import ConfirmModal from './ConfirmModal'
import './NavBar.css'

function NavBar() {
    const navigate = useNavigate()
    const [confirmingLogout, setConfirmingLogout] = useState(false)

    function handleLogoutConfirm() {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 21 12 16.5 6 21V4.6C6 3.7 6.7 3 7.6 3h8.8c.9 0 1.6.7 1.6 1.6V21Z" />
                    </svg>
                </div>
                <div className="navbar-links">
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Bookmarks</NavLink>
                    <NavLink to="/tags" className={({ isActive }) => isActive ? 'active' : ''}>Tags</NavLink>
                    <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
                </div>
                <button type="button" className="navbar-logout" onClick={() => setConfirmingLogout(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="navbar-logout-label">Logout</span>
                </button>
            </nav>
            <ConfirmModal
                open={confirmingLogout}
                title="Log out?"
                message="You'll need to log in again to access your bookmarks."
                confirmLabel="Log out"
                danger
                onConfirm={handleLogoutConfirm}
                onCancel={() => setConfirmingLogout(false)}
            />
        </>
    )
}

export default NavBar
