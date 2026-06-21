/* ===========================================================================
   AuthContext — app-wide authentication state
   ---------------------------------------------------------------------------
   React Context lets us share a value (here: the logged-in user and the
   auth actions) with the whole component tree WITHOUT passing props down
   through every level ("prop drilling").

   Any component can call `useAuth()` to read the current user or to sign up,
   log in, and log out.
   =========================================================================== */

import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase.js'

// The Context object itself. Components don't use this directly — they use the
// useAuth() hook below.
const AuthContext = createContext(null)

// Thrown if an auth action is attempted before Firebase keys are configured.
// We give it a `.code` so the Login page's error map handles it like any other.
function notConfiguredError() {
  const err = new Error('Firebase is not configured.')
  err.code = 'auth/not-configured'
  return Promise.reject(err)
}

/**
 * AuthProvider wraps the app (see main.jsx) and supplies the auth value to
 * everything inside it.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // the Firebase user, or null
  const [loading, setLoading] = useState(true) // true until we know the status

  // Subscribe to Firebase auth changes. onAuthStateChanged fires once on load
  // (with the restored session, if any) and again on every login/logout.
  useEffect(() => {
    // If Firebase isn't configured yet, there's nothing to listen to — just
    // finish loading with no user so the app still renders.
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    // Cleanup: stop listening when the provider unmounts.
    return unsubscribe
  }, [])

  // Thin wrappers around the Firebase functions so components don't import
  // Firebase directly. Each returns a Promise the caller can await. When
  // Firebase isn't configured, they reject with a friendly error.
  const value = {
    user,
    loading,
    isConfigured: isFirebaseConfigured,
    signup: (email, password) =>
      isFirebaseConfigured
        ? createUserWithEmailAndPassword(auth, email, password)
        : notConfiguredError(),
    login: (email, password) =>
      isFirebaseConfigured
        ? signInWithEmailAndPassword(auth, email, password)
        : notConfiguredError(),
    logout: () =>
      isFirebaseConfigured ? signOut(auth) : notConfiguredError(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth — the hook components use to access auth.
 * Example: const { user, login, logout } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return context
}
