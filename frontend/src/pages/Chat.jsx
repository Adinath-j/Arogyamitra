import { useNavigate } from 'react-router-dom'
import ChatUI from '../components/ChatUI'
import AromiAvatar from '../components/AromiAvatar'
import { useAuthStore } from '../stores/authStore'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function Chat() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const userId = user?.id

  return (
    <div className="page-enter max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex flex-col" style={{ height: 'calc(100vh - 72px)' }}>
      <div className="h-full flex flex-col glass rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">

        {/* Compact Chat Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.03] flex-shrink-0">
          <div className="flex items-center gap-3">
            <AromiAvatar size={36} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm sm:text-base text-white font-heading tracking-tight">AROMI</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-forest-500/15 border border-forest-500/25 text-forest-400 flex items-center gap-1">
                  <Sparkles size={10} /> AI Coach
                </span>
              </div>
              <p className="text-[11px] text-white/40 leading-none mt-0.5">
                {user ? `Personalized for ${user.name || user.full_name} · ${(user.goal || user.fitness_goal || 'General Health').replace(/_/g, ' ')}` : 'Your AI health & wellness companion'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[11px] text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-pulse" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Compact Warning if no profile */}
        {!userId && (
          <div className="mx-4 mt-3 px-3.5 py-2 rounded-xl bg-saffron-500/10 border border-saffron-500/20 text-xs text-saffron-300 flex items-center justify-between flex-shrink-0">
            <span>Set up your profile to receive personalized health & workout advice.</span>
            <button
              onClick={() => navigate('/profile')}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-saffron-500/20 hover:bg-saffron-500/30 text-saffron-200 transition-all flex items-center gap-1"
            >
              Profile <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Chat UI fills remaining space */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <ChatUI userId={userId ? parseInt(userId, 10) : null} />
        </div>
      </div>
    </div>
  )
}
