import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Navbar.css'

/**
 * Top navigation bar shown on every page.
 *
 * It reads the current user from useAuth() and shows different controls
 * depending on whether someone is logged in.
 */
export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/jobs')
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/jobs" className="navbar__brand">
          📋 TrackBoard
        </NavLink>

        <nav className="navbar__links">
          <NavLink to="/jobs" className="navbar__link">
            Job Board
          </NavLink>
          <NavLink to="/pipeline" className="navbar__link">
            My Pipeline
          </NavLink>

          {user ? (
            <>
              <span className="navbar__user" title={user.email}>
                {user.email}
              </span>
              <button
                type="button"
                className="navbar__link navbar__logout"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="navbar__link navbar__link--cta">
              Log in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
