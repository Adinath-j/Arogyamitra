import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat',      label: 'AROMI AI'  },
  { to: '/profile',   label: 'Profile'   },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-105 transition-transform">
            🌿
          </div>
          <span className="font-semibold text-white tracking-tight">
            Arogya<span className="text-forest-400">Mitra</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`
                  px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-forest-500/20 text-forest-300 border border-forest-500/30'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }
                `}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-400 pulse-dot" />
            <span className="hidden sm:block">{user?.full_name || user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}