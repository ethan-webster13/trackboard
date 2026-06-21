import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css'

// Firebase throws errors with machine-readable codes. Map the common ones to
// messages a human actually understands.
function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.'
    case 'auth/email-already-in-use':
      return 'An account with that email already exists. Try logging in.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/not-configured':
      return 'Login isn’t set up yet — Firebase keys are missing.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

/**
 * Login — real sign in / sign up backed by Firebase Auth.
 */
export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { signup, login } = useAuth()
  const navigate = useNavigate()
  const isLogin = mode === 'login'

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser's default form submission / reload
    setError('')
    setSubmitting(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password)
      }
      // On success, send the user to their pipeline.
      navigate('/pipeline')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setSubmitting(false)
    }
  }

  // Switch between login/signup and clear any stale error.
  function switchMode(next) {
    setMode(next)
    setError('')
  }

  return (
    <div className="container login">
      <div className="login__card">
        <h1 className="login__title">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="login__subtitle">
          {isLogin
            ? 'Log in to access your job pipeline.'
            : 'Sign up to start tracking applications.'}
        </p>

        <div className="login__tabs">
          <button
            type="button"
            className={`login__tab ${isLogin ? 'login__tab--active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={`login__tab ${!isLogin ? 'login__tab--active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <label className="login__field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="login__field">
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="login__error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary login__submit"
            disabled={submitting}
          >
            {submitting
              ? 'Please wait…'
              : isLogin
                ? 'Log in'
                : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
