import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authApi.login({ username: form.username, password: form.password })
      setUser({ id: data.user_id, username: data.username, full_name: data.full_name, access_token: data.access_token })
      toast.success(`Welcome back, ${data.full_name}! 🙏`)
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      let msg = 'Login failed'
      if (typeof detail === 'string') msg = detail
      else if (Array.isArray(detail)) msg = detail[0].msg
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(40,156,110,0.08)_0%,transparent_70%)]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-forest-500/20">🌿</div>
          <h1 className="text-2xl font-bold text-white">ArogyaMitra</h1>
          <p className="text-white/40 text-sm mt-1">Your AI Wellness Companion</p>
        </div>
        <div className="glass rounded-3xl border border-white/8 p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign In</h2>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Username or Email</label>
              <input required type="text" placeholder="rahul_sharma" autoComplete="username"
                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none p-1 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 pointer-events-none " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-forest-500 to-forest-600 text-white font-semibold text-sm hover:from-forest-400 hover:to-forest-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <><div className="spinner" />Signing in…</> : 'Sign In →'}
            </button>
          </form>
          <p className="text-center text-xs text-white/30 mt-5">
            New here?{' '}
            <Link to="/register" className="text-forest-400 hover:text-forest-300 transition-colors">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}