import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import JobBoard from './pages/JobBoard.jsx'
import Pipeline from './pages/Pipeline.jsx'
import Login from './pages/Login.jsx'

/**
 * App is the top-level layout. It renders the persistent Navbar and then
 * swaps the page content based on the URL via <Routes>.
 */
export default function App() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--space-6)' }}>
        <Routes>
          {/* Redirect the bare "/" to the job board */}
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/login" element={<Login />} />
          {/* Catch-all for unknown URLs */}
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  )
}
