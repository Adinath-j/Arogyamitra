import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Play, CheckCircle, RefreshCw, Calendar, Clock, Flame, ChevronRight, Dumbbell, Youtube } from 'lucide-react'
import toast from 'react-hot-toast'
import { workoutApi, calendarApi } from '../../services/api'
import ExercisePlayer from './ExercisePlayer'

const DAY_COLORS = [
  'border-forest-500/25 from-forest-500/10','border-blue-500/25 from-blue-500/10',
  'border-purple-500/25 from-purple-500/10','border-saffron-500/25 from-saffron-500/10',
  'border-pink-500/25 from-pink-500/10','border-teal-500/25 from-teal-500/10',
  'border-amber-500/25 from-amber-500/10',
]

export default function WorkoutPlans() {
  const qc = useQueryClient()
  const [activeDay, setActiveDay] = useState(0)
  const [activeTab, setActiveTab] = useState('today')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [completedExercises, setCompletedExercises] = useState({})

  const { data, isLoading } = useQuery({ queryKey: ['active-workout'], queryFn: workoutApi.getActive })

  const generateMutation = useMutation({
    mutationFn: workoutApi.generate,
    onSuccess: () => { toast.success('💪 New 7-day workout plan generated!'); qc.invalidateQueries({ queryKey: ['active-workout'] }) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Generation failed'),
  })

  const plan = data?.plan
  const days = plan?.plan || []
  const today = days[activeDay]

  const toggleExercise = (key) => setCompletedExercises(p => ({ ...p, [key]: !p[key] }))

  const syncCalendar = async () => {
    try {
      const { auth_url } = await calendarApi.getAuthUrl()
      window.open(auth_url, '_blank', 'width=500,height=600')
      toast.success('Authorize Google Calendar in the popup window!')
    } catch { toast.error('Calendar sync unavailable — check Google API credentials') }
  }

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Dumbbell size={22} className="text-forest-400" /> Workout Plans</h1>
          {plan && <p className="text-white/35 text-sm mt-1">{plan.title}</p>}
        </div>
        <div className="flex gap-2">
          {plan && (
            <button onClick={syncCalendar} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/25 bg-blue-500/8 text-blue-300 text-xs font-medium hover:bg-blue-500/15 transition-all">
              <Calendar size={13} /> Sync Calendar
            </button>
          )}
          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-500/20 border border-forest-500/30 text-forest-300 text-xs font-medium hover:bg-forest-500/30 transition-all disabled:opacity-50">
            <RefreshCw size={13} className={generateMutation.isPending ? 'animate-spin' : ''} />
            {generateMutation.isPending ? 'Generating…' : plan ? 'Regenerate' : 'Generate Plan'}
          </button>
        </div>
      </div>

      {!plan ? (
        <div className="glass rounded-2xl border border-white/8 p-16 text-center">
          <div className="text-5xl mb-4">🏋️</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Workout Plan Yet</h3>
          <p className="text-white/30 text-sm mb-6 max-w-sm mx-auto">Generate your AI-powered 7-day workout plan tailored to your goals.</p>
          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-forest-500 to-forest-600 text-white text-sm font-medium mx-auto flex items-center gap-2 disabled:opacity-50 hover:from-forest-400 transition-all">
            {generateMutation.isPending ? <><div className="spinner" style={{ width: 14, height: 14 }} />Generating…</> : '✨ Generate My Workout Plan'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            {['today', 'week'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${activeTab === t ? 'bg-forest-500/20 border-forest-500/30 text-forest-300' : 'border-white/8 text-white/40 hover:text-white/60'}`}>
                {t === 'today' ? `Day ${activeDay + 1} Detail` : '7-Day Overview'}
              </button>
            ))}
          </div>

          {activeTab === 'week' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {days.map((day, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => { setActiveDay(i); setActiveTab('today') }}
                  className={`glass rounded-2xl border bg-gradient-to-br to-transparent p-4 text-left hover:scale-[1.02] transition-all ${DAY_COLORS[i] || DAY_COLORS[0]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white/50">{day.day}</span>
                    <ChevronRight size={12} className="text-white/25" />
                  </div>
                  <div className="text-sm font-semibold text-white mb-2">{day.focus}</div>
                  <div className="flex gap-3 text-xs text-white/35">
                    <span className="flex items-center gap-1"><Clock size={10} />{day.estimated_duration_minutes}m</span>
                    <span className="flex items-center gap-1"><Flame size={10} />{day.calories_burned} kcal</span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-1.5 flex-wrap">
                {days.map((_, i) => (
                  <button key={i} onClick={() => setActiveDay(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeDay === i ? 'bg-forest-500/25 text-forest-300 border border-forest-500/40' : 'bg-white/5 text-white/35 border border-white/8 hover:text-white/55'}`}>
                    D{i + 1}
                  </button>
                ))}
              </div>

              {today && (
                <motion.div key={activeDay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`glass rounded-2xl border bg-gradient-to-br to-transparent p-6 ${DAY_COLORS[activeDay] || DAY_COLORS[0]}`}>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h2 className="text-lg font-bold text-white">{today.day} — {today.focus}</h2>
                      <div className="flex gap-4 mt-1.5 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Clock size={11} />{today.estimated_duration_minutes} min</span>
                        <span className="flex items-center gap-1"><Flame size={11} />{today.calories_burned} kcal</span>
                        <span className="capitalize border border-white/10 rounded px-2 py-0.5">{today.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 px-3 py-2.5 rounded-xl bg-white/4 border border-white/7 text-xs text-white/50">
                    <span className="text-forest-400 font-medium">🔥 Warm-up: </span>{today.warmup}
                  </div>

                  <div className="space-y-2 mb-4">
                    {today.exercises?.map((ex, i) => {
                      const key = `${activeDay}-${i}`
                      const done = completedExercises[key]
                      return (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? 'border-forest-500/30 bg-forest-500/8' : 'border-white/6 bg-white/3 hover:bg-white/5'}`}>
                          <button onClick={() => toggleExercise(key)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? 'border-forest-400 bg-forest-400' : 'border-white/20 hover:border-forest-400'}`}>
                            {done && <CheckCircle size={12} className="text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${done ? 'text-white/40 line-through' : 'text-white/80'}`}>{ex.name}</div>
                            <div className="text-xs text-white/30">{ex.muscle_group}</div>
                          </div>
                          <div className="text-xs text-white/40 text-right flex-shrink-0">
                            <div>{ex.sets} × {ex.reps}</div>
                            <div>Rest {ex.rest}</div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setSelectedExercise(ex)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"><Play size={12} className="text-white/50" /></button>
                            {ex.youtube_search && (
                              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.youtube_search)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all">
                                <Youtube size={12} className="text-red-400" />
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mb-4 px-3 py-2.5 rounded-xl bg-white/4 border border-white/7 text-xs text-white/50">
                    <span className="text-saffron-400 font-medium">🧊 Cool-down: </span>{today.cooldown}
                  </div>
                  {today.coaching_tip && (
                    <div className="px-4 py-3 rounded-xl bg-saffron-500/8 border border-saffron-500/15 text-xs text-saffron-300/80 italic">💡 {today.coaching_tip}</div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selectedExercise && <ExercisePlayer exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
      </AnimatePresence>
    </div>
  )
}   