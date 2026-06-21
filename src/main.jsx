import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { PipelineProvider } from './context/PipelineContext.jsx'

// Provider order matters: Router → Auth → Pipeline. PipelineProvider is inside
// AuthProvider because it needs to know the current user (from useAuth).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PipelineProvider>
          <App />
        </PipelineProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
