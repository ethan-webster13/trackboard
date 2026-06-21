/* ===========================================================================
   Firebase initialization
   ---------------------------------------------------------------------------
   This file creates the single shared Firebase app instance and exports the
   pieces the rest of the app needs (auth now; the Firestore database in
   Phase 5).

   The config values come from environment variables, NOT hard-coded here.
   In Vite, any variable in a .env file that starts with VITE_ is exposed to
   the browser as import.meta.env.VITE_*. See .env.example for the list.

   ℹ️ Note: Firebase "web API keys" are safe to expose in the browser — they
   identify your project, they don't grant admin access. Real security comes
   from Firebase Auth + Firestore security rules. We still use env vars so the
   repo stays clean and each environment (local, production) can be configured
   separately.
   =========================================================================== */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Whether the project keys have been filled in yet. Other files import this to
// decide whether auth features are available.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey)

// Only initialize Firebase if it's actually configured. This keeps the rest of
// the app (like the public Job Board) working before you've added your keys,
// instead of crashing the whole page with an "invalid-api-key" error.
let app = null
let auth = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
} else {
  console.warn(
    'Firebase is not configured yet. Copy .env.example to .env.local, fill in ' +
      'your project keys, then restart `npm run dev`. Auth features are disabled ' +
      'until then; the Job Board still works.'
  )
}

// The Auth service (or null if not configured). Any file can
// `import { auth } from './firebase'`.
export { auth }

export default app
