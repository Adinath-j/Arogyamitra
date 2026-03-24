import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import Navbar from './components/Navbar'

// Auth pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// App pages
import Dashboard from './pages/Dashboard'
import Chat      from './pages/Chat'
import Profile   from './pages/Profile'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AuthRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a2720', color: '#e2f5ec', border: '1px solid rgba(40,156,110,0.2)' },
      }} />
      <div className="min-h-screen flex flex-col">
        {isAuthenticated && <Navbar />}
        <main className="flex-1">
          <Routes>
            {/* Public auth routes */}
            <Route path="/login"    element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat"      element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}