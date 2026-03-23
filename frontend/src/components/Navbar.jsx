import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/',          label: 'Profile'   },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat',      label: 'AROMI AI'  },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-105 transition-transform">
            🌿
          </div>
          <span className="font-semibold text-white tracking-tight">
            Arogya<span className="text-forest-400">Mitra</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label }) => {
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

        {/* Status pill */}
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-400 pulse-dot" />
          AI Online
        </div>
      </div>
    </nav>
  )
}