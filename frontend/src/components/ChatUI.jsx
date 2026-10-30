import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../api/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import AromiAvatar from './AromiAvatar'
import { ArrowUp, RotateCcw, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  { label: '💧 Water Intake', text: 'How much water should I drink daily based on my weight?' },
  { label: '🥗 Post-Workout', text: 'What is a quick and healthy post-workout snack?' },
  { label: '⚡ Energy Boost', text: "I'm feeling low on energy today, what can I eat or do?" },
  { label: '🤸 Quick Warmup', text: 'Can you give me an effective 5-minute full body warm-up?' },
  { label: '🧘 Muscle Recovery', text: 'How can I prevent muscle soreness after exercising?' },
]

function Message({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex gap-2.5 bubble-enter ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5 bg-forest-500/20 border border-forest-500/30 text-forest-300 select-none">
          👤
        </div>
      ) : (
        <AromiAvatar size={28} className="mt-0.5 flex-shrink-0" />
      )}

      {/* Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] sm:text-[13.5px] leading-relaxed shadow-sm ${
          isUser
            ? 'bg-forest-600/25 border border-forest-500/30 text-white/95 rounded-tr-xs whitespace-pre-wrap'
            : 'bg-white/[0.04] border border-white/10 text-white/90 rounded-tl-xs markdown-body markdown-compact'
        }`}
      >
        {isUser ? (
          msg.content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              h1: ({ children }) => <h1 className="text-sm font-bold text-forest-300 mt-2 mb-1">{children}</h1>,
              h2: ({ children }) => <h2 className="text-[13.5px] font-semibold text-forest-300 mt-2 mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xs font-semibold text-forest-400 mt-1.5 mb-1">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
              li: ({ children }) => <li className="text-[13px] text-white/85">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-saffron-300">{children}</strong>,
              table: ({ children }) => (
                <div className="overflow-x-auto my-2 rounded-lg border border-white/10">
                  <table className="w-full text-xs text-left border-collapse">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="bg-white/5 p-1.5 border-b border-white/10 font-semibold text-white/70">{children}</th>,
              td: ({ children }) => <td className="p-1.5 border-b border-white/5 text-white/80">{children}</td>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 bubble-enter">
      <AromiAvatar size={28} className="flex-shrink-0" />
      <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-forest-400/60"
            style={{ animation: `pulseDot 1.2s ease infinite ${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ChatUI({ userId }) {
  const INITIAL_MESSAGE = {
    role: 'assistant',
    content: "Namaste! 🙏 I'm AROMI, your AI wellness coach. How can I support your fitness, nutrition, or health goals today?",
  }

  const [messages, setMessages] = useState([INITIAL_MESSAGE])
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
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please verify that the backend is active and try again. 🙏",
        },
      ])
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

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE])
    setInput('')
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 sm:py-4 space-y-3 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Compact Suggestions Row */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/30 flex items-center gap-1">
              <Sparkles size={11} className="text-forest-400" /> Suggested Topics
            </span>
            {messages.length > 1 && (
              <button
                onClick={resetChat}
                className="text-[11px] text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw size={10} /> Reset
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(s.text)}
                disabled={loading || !userId}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs bg-white/[0.04] hover:bg-forest-500/15 border border-white/8 hover:border-forest-500/30 text-white/60 hover:text-white transition-all disabled:opacity-40"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compact Input Bar */}
      <div className="p-3 pt-2 border-t border-white/5 bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-2 glass rounded-xl border border-white/10 px-3 py-1.5 focus-within:border-forest-500/40 focus-within:ring-1 focus-within:ring-forest-500/20 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={userId ? 'Ask AROMI a health question…' : 'Complete profile to start chatting…'}
            disabled={!userId || loading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-white/25 resize-none focus:outline-none py-1 max-h-24 disabled:opacity-40"
            style={{ scrollbarWidth: 'none' }}
          />

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || !userId}
            aria-label="Send message"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-forest-500 hover:bg-forest-400 disabled:opacity-20 disabled:hover:bg-forest-500 text-white transition-all flex items-center justify-center flex-shrink-0 shadow-sm shadow-forest-500/20"
          >
            {loading ? (
              <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            ) : (
              <ArrowUp size={15} strokeWidth={2.5} />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between px-1 mt-1">
          <span className="text-[10px] text-white/20">Press Enter to send · Shift+Enter for new line</span>
          {messages.length > 2 && (
            <button
              onClick={resetChat}
              className="text-[10px] text-white/25 hover:text-white/60 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={10} /> Clear Chat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
