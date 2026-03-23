import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileForm from '../components/ProfileForm'
import { createUser, generateWorkout, generateMeal } from '../api/api'

const FEATURES = [
  { icon: '🏋️', title: '7-Day Workout Plan',   desc: 'Personalized to your goal & schedule' },
  { icon: '🍱', title: 'Indian Meal Planning',  desc: 'Calorie-tracked desi recipes' },
  { icon: '🤖', title: 'AROMI AI Coach',        desc: 'Chat with your wellness expert 24/7' },
  { icon: '📈', title: 'Progress Tracking',     desc: 'Monitor your fitness journey' },
]

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError('')
    try {
      // 1. Create user
      setStep('Creating your profile…')
      const user = await createUser(formData)
      localStorage.setItem('arogyamitra_user_id', user.id)
      localStorage.setItem('arogyamitra_user_name', user.name)

      // 2. Generate plans in parallel
      setStep('Generating your 7-day workout plan with AI…')
      await generateWorkout(user.id)

      setStep('Crafting your personalized Indian meal plan…')
      await generateMeal(user.id)

      // 3. Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Something went wrong.'
      setError(msg)
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-forest-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[200px] h-[200px] bg-saffron-500/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-forest-500/20 text-xs text-forest-400 mb-8">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-forest-400" />
            Powered by LLaMA 3.3-70B via Groq
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-tight">
            Your AI-Powered<br />
            <span className="gradient-text">Wellness Companion</span>
          </h1>

          <p className="text-lg text-white/40 max-w-xl mx-auto mb-12">
            ArogyaMitra crafts hyper-personalized workout plans, Indian meal plans, and connects you with AROMI — your 24/7 AI coach.
          </p>

          {/* Feature pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-16">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-4 text-left border border-white/5 hover:border-white/10 transition-all">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-sm font-medium text-white/80 mb-1">{title}</div>
                <div className="text-xs text-white/30">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <div className="glass rounded-3xl border border-white/8 p-8 glow-green">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-1">Build Your Profile</h2>
            <p className="text-sm text-white/35">Tell us about yourself and we'll generate your personalized plan in seconds.</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              ❌ {error}
            </div>
          )}

          {step && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-forest-500/10 border border-forest-500/20 text-sm text-forest-300 flex items-center gap-3">
              <div className="spinner flex-shrink-0" />
              {step}
            </div>
          )}

          <ProfileForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  )
}