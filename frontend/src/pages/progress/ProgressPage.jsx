import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, Plus, Flame, Droplets, Moon, Footprints } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'
import { progressApi } from '../../services/api'
import { format } from 'date-fns'

const MOODS = [
  { value: 'great', emoji: '😄', label: 'Great'  },
  { value: 'good',  emoji: '🙂', label: 'Good'   },
  { value: 'okay',  emoji: '😐', label: 'Okay'   },
  { value: 'bad',   emoji: '😔', label: 'Bad'    },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl border border-white/10 px-3 py-2 text-xs">
      <div className="text-white/40 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}</span></div>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ weight: '', calories_burned: '', workout_duration: '', steps: '', water_intake: '', sleep_hours: '', mood: 'good', notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { data: histData } = useQuery({ queryKey: ['progress-history'], queryFn: () => progressApi.history(30) })
  const { data: statsData } = useQuery({ queryKey: ['progress-stats'], queryFn: progressApi.stats })

  const logMutation = useMutation({
    mutationFn: progressApi.log,
    onSuccess: () => {
      toast.success('📊 Progress logged!')
      setShowForm(false)
      setForm({ weight: '', calories_burned: '', workout_duration: '', steps: '', water_intake: '', sleep_hours: '', mood: 'good', notes: '' })
      qc.invalidateQueries({ queryKey: ['progress-history'] })
      qc.invalidateQueries({ queryKey: ['progress-stats'] })
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Log failed'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      weight: form.weight ? parseFloat(form.weight) : undefined,
      calories_burned: form.calories_burned ? parseFloat(form.calories_burned) : 0,
      workout_duration: form.workout_duration ? parseInt(form.workout_duration) : 0,
      steps: form.steps ? parseInt(form.steps) : 0,
      water_intake: form.water_intake ? parseFloat(form.water_intake) : 0,
      sleep_hours: form.sleep_hours ? parseFloat(form.sleep_hours) : 0,
      mood: form.mood,
      notes: form.notes,
    }
    logMutation.mutate(payload)
  }

  const logs = histData?.logs || []
  const chartData = logs.map(l => ({
    date: format(new Date(l.date), 'dd MMM'),
    weight: l.weight,
    calories: Math.round(l.calories_burned),
    sleep: l.sleep_hours,
    duration: l.workout_duration,
  })).filter(d => d.weight || d.calories || d.sleep)

  const stats = statsData || {}

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TrendingUp size={22} className="text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Progress</h1>
        </div>
        <button onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-500/30 transition-all">
          <Plus size={13} /> Log Today
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Flame,     label: '🔥 Streak',          value: `${stats.current_streak || 0} days`     },
          { icon: TrendingUp, label: '💪 Total Workouts',  value: stats.total_workouts || 0               },
          { icon: Flame,     label: '⚡ Calories (total)', value: `${Math.round(stats.total_calories_burned || 0)} kcal` },
          { icon: TrendingUp, label: '🌳 Charity Points',  value: stats.charity_points || 0               },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-2xl border border-white/6 p-4">
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-white/35 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Log form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="glass rounded-2xl border border-white/8 p-6 mb-8 overflow-hidden">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-5">Log Today's Metrics</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { k: 'weight',           label: 'Weight (kg)',   ph: '70.5', icon: '⚖️' },
                { k: 'calories_burned',  label: 'Calories Burned', ph: '300', icon: '🔥' },
                { k: 'workout_duration', label: 'Workout (min)', ph: '45',   icon: '⏱️' },
                { k: 'steps',            label: 'Steps',         ph: '8000', icon: '👟' },
                { k: 'water_intake',     label: 'Water (L)',     ph: '2.5',  icon: '💧' },
                { k: 'sleep_hours',      label: 'Sleep (hrs)',   ph: '7.5',  icon: '🌙' },
              ].map(({ k, label, ph, icon }) => (
                <div key={k}>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">{icon} {label}</label>
                  <input type="number" step="0.1" placeholder={ph} value={form[k]}
                    onChange={e => set(k, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/18 focus:outline-none focus:border-blue-500/40 transition-all text-sm" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">How are you feeling?</label>
              <div className="flex gap-2">
                {MOODS.map(({ value, emoji, label }) => (
                  <button key={value} type="button" onClick={() => set('mood', value)}
                    className={`flex-1 py-2 rounded-xl text-xs border transition-all flex flex-col items-center gap-0.5 ${form.mood === value ? 'border-blue-500/50 bg-blue-500/12 text-blue-300' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                    <span className="text-lg">{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">Notes (optional)</label>
              <input type="text" placeholder="How did your workout feel today?" value={form.notes} onChange={e => set('notes', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/18 focus:outline-none focus:border-blue-500/40 transition-all text-sm" />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-all">Cancel</button>
              <button type="submit" disabled={logMutation.isPending}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {logMutation.isPending ? <><div className="spinner" />Saving…</> : '📊 Save Log'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="space-y-5">
          {/* Weight chart */}
          {chartData.some(d => d.weight) && (
            <div className="glass rounded-2xl border border-white/8 p-6">
              <h3 className="text-sm font-medium text-white/60 mb-5">⚖️ Weight Trend (kg)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="#4db889" strokeWidth={2} dot={{ fill: '#4db889', r: 3 }} name="Weight kg" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Calories + Sleep chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass rounded-2xl border border-white/8 p-6">
              <h3 className="text-sm font-medium text-white/60 mb-5">🔥 Calories Burned</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="calories" stroke="#ff9c37" strokeWidth={2} dot={{ fill: '#ff9c37', r: 3 }} name="kcal" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-2xl border border-white/8 p-6">
              <h3 className="text-sm font-medium text-white/60 mb-5">🌙 Sleep Hours</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} domain={[0, 10]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="sleep" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} name="hours" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/8 p-16 text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Progress Logged Yet</h3>
          <p className="text-white/30 text-sm mb-5">Start logging your daily metrics to see charts and trends here.</p>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm hover:bg-blue-500/30 transition-all">
            + Log Your First Entry
          </button>
        </div>
      )}
    </div>
  )
}