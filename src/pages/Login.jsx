import { useState } from 'react'
import './Login.css'

/**
 * Login — sign in / sign up page.
 *
 * Phase 2 builds the *visual* form: a centered card with a Log in / Sign up
 * toggle. The fields don't do anything yet — we connect them to Firebase Auth
 * in Phase 4. The `mode` state already lets us switch the form's wording.
 */
export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const isLogin = mode === 'login'

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

        {/* Toggle between the two modes */}
        <div className="login__tabs">
          <button
            type="button"
            className={`login__tab ${isLogin ? 'login__tab--active' : ''}`}
            onClick={() => setMode('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={`login__tab ${!isLogin ? 'login__tab--active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        {/* preventDefault stops the page from reloading; real submit in Phase 4 */}
        <form className="login__form" onSubmit={(e) => e.preventDefault()}>
          <label className="login__field">
            <span>Email</span>
            <input type="email" placeholder="you@example.com" autoComplete="email" />
          </label>

          <label className="login__field">
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </label>

          <button type="submit" className="btn btn-primary login__submit">
            {isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
