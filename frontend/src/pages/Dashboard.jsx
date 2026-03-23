import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkoutCard from '../components/WorkoutCard'
import MealCard from '../components/MealCard'
import { getLatestPlans, getUser, generateWorkout, generateMeal } from '../api/api'

export default function Dashboard() {
  const [plans, setPlans]     = useState({ workout: null, meal: null })
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [regen, setRegen]     = useState('')
  const [tab, setTab]         = useState('workout')
  const navigate = useNavigate()

  const userId = localStorage.getItem('arogyamitra_user_id')

  useEffect(() => {
    if (!userId) { navigate('/'); return }
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [userData, plansData] = await Promise.all([
        getUser(userId),
        getLatestPlans(userId),
      ])
      setUser(userData)
      setPlans(plansData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegen = async (type) => {
    setRegen(type)
    try {
      if (type === 'workout') await generateWorkout(userId)
      else await generateMeal(userId)
      await loadData()
    } catch (err) {
      alert('Regeneration failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setRegen('')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p className="text-white/40 text-sm">Loading your wellness dashboard…</p>
      </div>
    )
  }

  const goalLabel = user?.goal?.replace('_', ' ') || ''

  return (
    <div className="page-enter max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Namaste, <span className="text-forest-400">{user?.name}</span> 🙏
          </h1>
          <p className="text-white/40 mt-1 text-sm capitalize">
            Goal: {goalLabel} · {user?.diet_type} · {user?.time_availability} min/day
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 rounded-xl bg-saffron-500/15 border border-saffron-500/25 text-saffron-300 text-sm font-medium hover:bg-saffron-500/25 transition-all"
          >
            💬 Chat with AROMI
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:text-white/80 hover:bg-white/8 transition-all"
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Age',      value: user?.age + ' yrs',          icon: '🎂' },
          { label: 'Goal',     value: goalLabel,                    icon: '🎯' },
          { label: 'Diet',     value: user?.diet_type,              icon: '🥗' },
          { label: 'Daily',    value: user?.time_availability + ' min', icon: '⏱️' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="glass rounded-2xl border border-white/5 p-4">
            <div className="text-xl mb-2">{icon}</div>
            <div className="text-xs text-white/35 mb-0.5 uppercase tracking-wider">{label}</div>
            <div className="text-sm font-semibold text-white capitalize">{value}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'workout', label: '🏋️ Workout Plan' },
          { key: 'meal',    label: '🍱 Meal Plan'    },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`
              px-5 py-2.5 rounded-xl text-sm font-medium transition-all
              ${tab === key
                ? key === 'workout'
                  ? 'bg-forest-500/20 border border-forest-500/35 text-forest-300'
                  : 'bg-saffron-500/20 border border-saffron-500/35 text-saffron-300'
                : 'bg-white/5 border border-white/8 text-white/45 hover:text-white/70'
              }
            `}
          >
            {label}
          </button>
        ))}

        <div className="ml-auto">
          <button
            onClick={() => handleRegen(tab)}
            disabled={!!regen}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-white/40 hover:text-white/70 hover:bg-white/8 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {regen === tab ? <><div className="spinner" style={{ width: 12, height: 12 }} /> Regenerating…</> : '🔄 Regenerate'}
          </button>
        </div>
      </div>

      {/* Plan content */}
      <div className="page-enter" key={tab}>
        {tab === 'workout' && (
          plans.workout
            ? <WorkoutCard plan={plans.workout} />
            : <EmptyState type="workout" onGenerate={() => handleRegen('workout')} loading={regen === 'workout'} />
        )}
        {tab === 'meal' && (
          plans.meal
            ? <MealCard plan={plans.meal} />
            : <EmptyState type="meal" onGenerate={() => handleRegen('meal')} loading={regen === 'meal'} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ type, onGenerate, loading }) {
  return (
    <div className="glass rounded-2xl border border-white/8 p-12 text-center">
      <div className="text-4xl mb-4">{type === 'workout' ? '🏋️' : '🍱'}</div>
      <h3 className="text-lg font-semibold text-white mb-2">No {type} plan found</h3>
      <p className="text-sm text-white/35 mb-6">Generate your personalized {type} plan with AI.</p>
      <button
        onClick={onGenerate}
        disabled={loading}
        className="px-6 py-3 rounded-xl bg-forest-500/20 border border-forest-500/30 text-forest-300 text-sm font-medium hover:bg-forest-500/30 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
      >
        {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Generating…</> : `✨ Generate ${type} Plan`}
      </button>
    </div>
  )
}