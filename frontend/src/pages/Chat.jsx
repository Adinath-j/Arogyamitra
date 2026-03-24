import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatUI from '../components/ChatUI'
import { useAuthStore } from '../stores/authStore'

export default function Chat() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const userId = user?.id


  return (
    <div className="page-enter max-w-4xl mx-auto px-4 py-6" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="h-full flex flex-col glass rounded-3xl border border-white/8 overflow-hidden">

        {/* Chat header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-saffron-500/40 to-forest-500/40 border border-white/10 flex items-center justify-center text-xl">
            🌿
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white">AROMI</h2>
              <span className="px-2 py-0.5 rounded-full text-xs bg-forest-500/15 border border-forest-500/25 text-forest-400">AI Coach</span>
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