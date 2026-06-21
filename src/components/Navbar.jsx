import { NavLink } from 'react-router-dom'
import './Navbar.css'

/**
 * Top navigation bar shown on every page.
 *
 * NavLink is like a normal link, but it automatically adds an "active" class
 * when its `to` matches the current URL — we use that to highlight the
 * current page.
 */
export default function Navbar() {
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
          <NavLink to="/login" className="navbar__link navbar__link--cta">
            Log in
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
