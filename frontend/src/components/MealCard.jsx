import { useState } from 'react'

const MEAL_ICONS = {
  breakfast:   { icon: '🌅', label: 'Breakfast' },
  mid_morning: { icon: '🍎', label: 'Mid Morning' },
  lunch:       { icon: '🍱', label: 'Lunch' },
  evening:     { icon: '🍵', label: 'Evening Snack' },
  dinner:      { icon: '🌙', label: 'Dinner' },
}

function MealRow({ mealKey, meal }) {
  const meta = MEAL_ICONS[mealKey] || { icon: '🍽️', label: mealKey }
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/35 mb-0.5">{meta.label}</div>
        <div className="text-sm text-white/80 font-medium truncate">{meal.dish}</div>
        {meal.notes && <div className="text-xs text-white/30 mt-0.5">{meal.notes}</div>}
      </div>
      <div className="text-xs font-medium text-saffron-400 flex-shrink-0">
        {meal.calories} kcal
      </div>
    </div>
  )
}

export default function MealCard({ plan }) {
  const [activeDay, setActiveDay] = useState(0)

  if (!plan || !plan.plan) return null

  const days = plan.plan
  const today = days[activeDay]

  return (
    <div className="space-y-4">

      {/* Day tabs */}
      <div className="flex gap-2 flex-wrap">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${activeDay === i
                ? 'bg-saffron-500/25 text-saffron-300 border border-saffron-500/40'
                : 'bg-white/5 text-white/40 border border-white/8 hover:text-white/60 hover:bg-white/8'
              }
            `}
          >
            {d.day.replace('Day ', 'D')}
          </button>
        ))}
      </div>

      {/* Day card */}
      <div className="glass rounded-2xl border border-saffron-500/20 bg-gradient-to-br from-saffron-500/10 to-earth-600/5 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-white text-lg">{today.day}</h3>
            <p className="text-xs text-white/40 mt-0.5">Indian Meal Plan</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-saffron-400">{today.total_calories}</div>
            <div className="text-xs text-white/30">kcal / day</div>
          </div>
        </div>

        {/* Calorie bar */}
        <div className="mb-5">
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-saffron-500 to-saffron-400 transition-all duration-500"
              style={{ width: `${Math.min((today.total_calories / 2500) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/20 mt-1">
            <span>0</span><span>2500 kcal target</span>
          </div>
        </div>

        {/* Meals */}
        {today.meals && Object.entries(today.meals).map(([key, meal]) => (
          <MealRow key={key} mealKey={key} meal={meal} />
        ))}
      </div>
    </div>
  )
}