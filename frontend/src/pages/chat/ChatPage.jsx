import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Send, Bot, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { chatApi, authApi } from '../../services/api'

const SUGGESTIONS = [
  "How much water should I drink daily?",
  "What's a good post-workout snack?",
  "I'm feeling low on energy — what should I eat?",
  "Can I workout during festival season?",
  "How do I reduce belly fat?",
  "What is Surya Namaskar good for?",
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${isUser ? 'bg-forest-500/20 border border-forest-500/25' : 'bg-gradient-to-br from-saffron-500/30 to-forest-500/25 border border-white/10'}`}>
        {isUser ? '👤' : '🌿'}
      </div>
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-forest-500/18 border border-forest-500/18 text-white/90 rounded-tr-sm' : 'bg-white/5 border border-white/7 text-white/78 rounded-tl-sm'}`}>
        {msg.content}
      </div>
    </motion.div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-saffron-500/30 to-forest-500/25 border border-white/10 flex items-center justify-center text-sm flex-shrink-0">🌿</div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/7 flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Namaste! 🙏 I'm AROMI, your AI wellness coach. I'm here to guide you on your fitness journey with personalized advice on workouts, nutrition, and healthy living. What's on your mind today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const { data: profile } = useQuery({ queryKey: ['me'], queryFn: authApi.me })

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { reply, session_id } = await chatApi.send(newMessages, sessionId)
      setSessionId(session_id)
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch (err) {
      toast.error('Chat failed — please try again')
      setMessages([...newMessages, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment. 🙏" }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  const resetChat = () => {
    setMessages([{ role: 'assistant', content: "Namaste! 🙏 I'm AROMI — ready for a fresh conversation. How can I help you today?" }])
    setSessionId(null)
    setInput('')
  }

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 py-4" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="h-full flex flex-col glass rounded-3xl border border-white/8 overflow-hidden">

        {/* Chat header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-saffron-500/40 to-forest-500/35 border border-white/10 flex items-center justify-center text-xl">🌿</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white text-sm">AROMI</h2>
              <span className="px-2 py-0.5 rounded-full text-xs bg-forest-500/15 border border-forest-500/25 text-forest-400">AI Coach</span>
            </div>
            <p className="text-xs text-white/30 mt-0.5">
              {profile ? `Personalized for ${profile.full_name} · ${profile.fitness_goal?.replace('_', ' ')}` : 'Your AI wellness companion'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400 pulse-dot" />
              LLaMA 3.3-70B
            </div>
            <button onClick={resetChat} className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/5 transition-all" title="New conversation">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-0">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions — show only at start */}
        {messages.length === 1 && (
          <div className="px-5 pb-3 flex-shrink-0">
            <p className="text-xs text-white/20 mb-2 uppercase tracking-widest">Try asking…</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/8 text-white/45 hover:text-white/70 hover:bg-white/8 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 flex-shrink-0">
          <div className="flex gap-3 glass rounded-2xl border border-white/8 p-2 focus-within:border-forest-500/35 transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask AROMI anything about your health and fitness…"
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 resize-none focus:outline-none py-2 px-2 max-h-32 disabled:opacity-40"
              style={{ scrollbarWidth: 'none' }}
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-forest-500 hover:bg-forest-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0 self-end">
              {loading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={14} className="text-white" />}
            </button>
          </div>
          <p className="text-center text-xs text-white/12 mt-1.5">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}