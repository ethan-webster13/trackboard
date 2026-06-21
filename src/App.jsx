import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import JobBoard from './pages/JobBoard.jsx'
import Pipeline from './pages/Pipeline.jsx'
import Login from './pages/Login.jsx'
import './App.css'

/**
 * App is the top-level layout. It renders the persistent Navbar and Footer,
 * and swaps the page content in the middle based on the URL via <Routes>.
 *
 * The `app-shell` wrapper is a flex column so the footer always sits at the
 * bottom of the screen, even on short pages.
 */
export default function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main">
        <Routes>
          {/* Redirect the bare "/" to the job board */}
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route
            path="/pipeline"
            element={
              <ProtectedRoute>
                <Pipeline />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          {/* Catch-all for unknown URLs */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
      <h1>404</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        That page doesn’t exist.
      </p>
    </div>
  )
}
