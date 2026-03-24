import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Salad, RefreshCw, CheckCircle, ShoppingCart, Clock, ChevronRight, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { nutritionApi } from '../../services/api'

const MEAL_META = {
  breakfast:   { icon: '🌅', label: 'Breakfast'     },
  mid_morning: { icon: '🍎', label: 'Mid Morning'   },
  lunch:       { icon: '🍱', label: 'Lunch'         },
  evening:     { icon: '🍵', label: 'Evening Snack' },
  dinner:      { icon: '🌙', label: 'Dinner'        },
}

export default function NutritionPlans() {
  const qc = useQueryClient()
  const [activeDay, setActiveDay] = useState(0)
  const [activeTab, setActiveTab] = useState('today')
  const [completedMeals, setCompletedMeals] = useState({})

  const { data, isLoading } = useQuery({ queryKey: ['active-meal'], queryFn: nutritionApi.getActive })

  const generateMutation = useMutation({
    mutationFn: nutritionApi.generate,
    onSuccess: () => { toast.success('🍱 New 7-day meal plan generated!'); qc.invalidateQueries({ queryKey: ['active-meal'] }) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Generation failed'),
  })

  const plan = data?.plan
  const days = plan?.plan || []
  const today = days[activeDay]

  const toggleMeal = (key) => setCompletedMeals(p => ({ ...p, [key]: !p[key] }))

  // Build grocery list from all days
  const groceryItems = days.flatMap((day, di) =>
    Object.entries(day.meals || {}).map(([type, meal]) => ({
      dish: meal.dish,
      day: day.day,
      type,
    }))
  )
  const uniqueIngredients = [...new Set(groceryItems.map(g => g.dish.split(' + ')).flat().map(s => s.trim()))]

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Salad size={22} className="text-saffron-400" /> Nutrition Plans</h1>
          {plan && <p className="text-white/35 text-sm mt-1">{plan.title}</p>}
        </div>
        <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-saffron-500/20 border border-saffron-500/30 text-saffron-300 text-xs font-medium hover:bg-saffron-500/30 transition-all disabled:opacity-50 self-start sm:self-auto">
          <RefreshCw size={13} className={generateMutation.isPending ? 'animate-spin' : ''} />
          {generateMutation.isPending ? 'Generating…' : plan ? 'Regenerate' : 'Generate Plan'}
        </button>
      </div>

      {!plan ? (
        <div className="glass rounded-2xl border border-white/8 p-16 text-center">
          <div className="text-5xl mb-4">🍱</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Meal Plan Yet</h3>
          <p className="text-white/30 text-sm mb-6 max-w-sm mx-auto">Generate your personalized 7-day Indian meal plan.</p>
          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-saffron-600 text-white text-sm font-medium mx-auto flex items-center gap-2 disabled:opacity-50">
            {generateMutation.isPending ? <><div className="spinner" style={{ width: 14, height: 14 }} />Generating…</> : '✨ Generate My Meal Plan'}
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[{ k: 'today', label: `Day ${activeDay + 1} Detail` }, { k: 'week', label: '7-Day Overview' }, { k: 'grocery', label: '🛒 Grocery List' }].map(({ k, label }) => (
              <button key={k} onClick={() => setActiveTab(k)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${activeTab === k ? 'bg-saffron-500/20 border-saffron-500/30 text-saffron-300' : 'border-white/8 text-white/40 hover:text-white/60'}`}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'week' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {days.map((day, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => { setActiveDay(i); setActiveTab('today') }}
                  className="glass rounded-2xl border border-saffron-500/20 bg-gradient-to-br from-saffron-500/8 to-transparent p-4 text-left hover:scale-[1.02] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white/50">{day.day}</span>
                    <ChevronRight size={12} className="text-white/25" />
                  </div>
                  <div className="text-xl font-bold text-saffron-400 mb-1">{day.total_calories}</div>
                  <div className="text-xs text-white/30">kcal · {day.total_protein_g || '?'}g protein</div>
                </motion.button>
              ))}
            </div>
          )}

          {activeTab === 'today' && today && (
            <div className="space-y-4">
              {/* Day selector */}
              <div className="flex gap-1.5 flex-wrap">
                {days.map((_, i) => (
                  <button key={i} onClick={() => setActiveDay(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeDay === i ? 'bg-saffron-500/25 text-saffron-300 border border-saffron-500/40' : 'bg-white/5 text-white/35 border border-white/8 hover:text-white/55'}`}>
                    D{i + 1}
                  </button>
                ))}
              </div>

              <motion.div key={activeDay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl border border-saffron-500/20 bg-gradient-to-br from-saffron-500/8 to-transparent p-6">

                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-white">{today.day}</h2>
                    <p className="text-xs text-white/40 mt-0.5">7-Day Indian Meal Plan</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-saffron-400">{today.total_calories}</div>
                    <div className="text-xs text-white/30">kcal / day</div>
                  </div>
                </div>

                {/* Calorie bar */}
                <div className="mb-6">
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-saffron-500 to-saffron-400 transition-all duration-500"
                      style={{ width: `${Math.min((today.total_calories / 2500) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-white/20 mt-1"><span>0</span><span>2500 kcal</span></div>
                </div>

                {/* Meals */}
                {today.meals && Object.entries(today.meals).map(([mealKey, meal]) => {
                  const meta = MEAL_META[mealKey] || { icon: '🍽️', label: mealKey }
                  const key  = `${activeDay}-${mealKey}`
                  const done = completedMeals[key]
                  return (
                    <div key={mealKey} className={`flex items-center gap-4 py-3 border-b border-white/5 last:border-0 transition-all ${done ? 'opacity-50' : ''}`}>
                      <button onClick={() => toggleMeal(key)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? 'border-forest-400 bg-forest-400' : 'border-white/20 hover:border-forest-400'}`}>
                        {done && <CheckCircle size={12} className="text-white" />}
                      </button>
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">{meta.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/30 mb-0.5">{meta.label}</div>
                        <div className={`text-sm font-medium truncate ${done ? 'line-through text-white/40' : 'text-white/80'}`}>{meal.dish}</div>
                        {meal.notes && <div className="text-xs text-white/25 mt-0.5">{meal.notes}</div>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-saffron-400">{meal.calories}</div>
                        <div className="text-xs text-white/25">kcal</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/25 flex-shrink-0">
                        {meal.preparation_time_minutes && <span className="flex items-center gap-1"><Clock size={10} />{meal.preparation_time_minutes}m</span>}
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(meal.dish + ' Indian recipe')}`}
                          target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </div>
          )}

          {activeTab === 'grocery' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl border border-white/8 p-6">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingCart size={18} className="text-saffron-400" />
                <h3 className="font-semibold text-white">Weekly Grocery List</h3>
                <span className="text-xs text-white/30 ml-auto">{uniqueIngredients.length} items</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {uniqueIngredients.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/6 text-sm text-white/65">
                    <span className="w-1.5 h-1.5 rounded-full bg-saffron-400/60 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}