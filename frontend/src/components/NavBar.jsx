import { Link, useNavigate } from 'react-router-dom'
import './NavBar.css'

function NavBar() {
    const navigate = useNavigate()

    function handleLogout() {
        if (!window.confirm('Log out?')) {
            return
        }
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <div className="navbar-links">
                <Link to="/">Bookmarks</Link>
                <Link to="/tags">Tags</Link>
                <Link to="/profile">Profile</Link>
            </div>
            <button type="button" className="navbar-logout" onClick={handleLogout}>
                Logout
            </button>
        </nav>
    )
}

export default NavBar
