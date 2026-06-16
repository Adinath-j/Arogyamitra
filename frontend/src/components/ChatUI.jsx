import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../api/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import AromiAvatar from './AromiAvatar'

const SUGGESTIONS = [
  "How much water should I drink daily?",
  "What's a good post-workout meal?",
  "I'm feeling low on energy, what should I eat?",
  "Can I workout during festival season?",
  "How do I avoid muscle soreness?",
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 bubble-enter ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5 bg-forest-500/20 border border-forest-500/30">
          👤
        </div>
      ) : (
        <AromiAvatar size={32} className="mt-0.5" />
      )}

      {/* Bubble */}
      <div className={`
        max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? 'bg-forest-500/20 border border-forest-500/20 text-white/90 rounded-tr-sm whitespace-pre-wrap'
          : 'bg-white/5 border border-white/8 text-white/80 rounded-tl-sm markdown-body'
        }
      `}>
        {isUser ? (
          msg.content
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 bubble-enter">
      <AromiAvatar size={32} />
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/8 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/30"
            style={{ animation: `pulseDot 1.2s ease infinite ${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ChatUI({ userId }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Namaste! 🙏 I'm AROMI, your personal AI wellness coach. I'm here to guide you on your fitness journey with personalized advice on workouts, nutrition, and healthy living. What's on your mind today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !userId) return

    const userMsg = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { reply } = await sendChatMessage(userId, text.trim())
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check if the backend is running and try again. 🙏",
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only show when no user messages yet */}
      {messages.length === 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-white/25 mb-2 uppercase tracking-widest">Try asking…</p>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/8 text-white/50 hover:text-white/80 hover:bg-white/8 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No user warning */}
      {!userId && (
        <div className="mx-4 mb-3 px-4 py-3 rounded-xl bg-saffron-500/10 border border-saffron-500/20 text-xs text-saffron-300">
          ⚠️ Please create your profile first to get personalized advice.
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4">
        <div className="flex gap-3 glass rounded-2xl border border-white/8 p-2 focus-within:border-forest-500/40 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={userId ? "Ask AROMI anything about your health…" : "Create a profile to start chatting…"}
            disabled={!userId || loading}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/20 resize-none focus:outline-none py-2 px-2 max-h-32 disabled:opacity-40"
            style={{ scrollbarWidth: 'none' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || !userId}
            className="w-10 h-10 rounded-xl bg-forest-500 hover:bg-forest-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0 self-end"
          >
            {loading
              ? <div className="spinner" style={{ width: 16, height: 16 }} />
              : <span className="text-base">↑</span>
            }
          </button>
        </div>
        <p className="text-center text-xs text-white/15 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}