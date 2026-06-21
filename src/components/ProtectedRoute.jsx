import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * ProtectedRoute — wraps a page that requires login.
 *
 * - While we're still checking the auth status, show nothing (avoids a flash
 *   of the login page for users who are actually logged in).
 * - If there's no user, redirect to /login.
 * - Otherwise, render the protected page (`children`).
 *
 * Usage in App.jsx:
 *   <Route path="/pipeline" element={
 *     <ProtectedRoute><Pipeline /></ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
