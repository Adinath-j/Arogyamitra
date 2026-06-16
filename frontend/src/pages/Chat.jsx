import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatUI from '../components/ChatUI'
import AromiAvatar from '../components/AromiAvatar'
import { useAuthStore } from '../stores/authStore'

export default function Chat() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const userId = user?.id


  return (
    <div className="page-enter max-w-5xl mx-auto px-6 py-8" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="h-full flex flex-col glass rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl shadow-forest-500/5">

        {/* Chat header */}
        <div className="flex items-center gap-5 px-8 py-5 border-b border-white/5 flex-shrink-0 bg-white/5">
          <AromiAvatar size={48} />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg text-white font-heading tracking-wide">AROMI</h2>
              <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-forest-500/15 border border-forest-500/25 text-forest-400">AI Coach</span>
            </div>
            <p className="text-xs text-white/35 mt-0.5">
              {user ? `Personalized for ${user.name} · ${user.goal?.replace('_',' ')}` : 'Your AI wellness companion'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-400 pulse-dot" />
            LLaMA 3.3-70B
          </div>
        </div>

        {/* No profile warning */}
        {!userId && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-saffron-500/10 border border-saffron-500/20 text-sm text-saffron-300 flex items-center justify-between flex-shrink-0">
            <span>⚠️ Create your profile for personalized coaching.</span>
            <button
              onClick={() => navigate('/profile')}
              className="text-xs px-3 py-1 rounded-lg bg-saffron-500/20 hover:bg-saffron-500/30 transition-all"
            >
              Set up profile →
            </button>
          </div>
        )}

        {/* Chat UI fills remaining space */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <ChatUI userId={userId ? parseInt(userId) : null} />
        </div>
      </div>
    </div>
  )
}