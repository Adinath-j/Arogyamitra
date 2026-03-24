import { useState } from 'react'

const MEAL_ICONS = {
  breakfast:   { icon: '🌅', label: 'Breakfast' },
  mid_morning: { icon: '🍎', label: 'Mid Morning' },
  lunch:       { icon: '🍱', label: 'Lunch' },
  evening:     { icon: '🍵', label: 'Evening Snack' },
  dinner:      { icon: '🌙', label: 'Dinner' },
}

function MealRow({ mealKey, meal }) {
  const meta = MEAL_ICONS[mealKey] || { icon: '🍽️', label: mealKey.replace(/_/g, ' ') }
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 group">
      <div className="w-10 h-10 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center text-lg shrink-0 group-hover:bg-saffron-500/20 transition-colors">
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">{meta.label}</div>
        <div className="text-sm text-white/90 font-medium truncate group-hover:text-white transition-colors">
          {meal.dish}
          {meal.recipe_link && (
            <a href={meal.recipe_link} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center text-xs text-saffron-400/80 hover:text-saffron-400 transition-colors">
              <span>Recipe</span>
              <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          )}
        </div>
        <div className="flex gap-3 text-xs text-white/40 mt-1 shrink-0">
          {meal.notes && <span>{meal.notes}</span>}
          {meal.ready_in_minutes && <span>⏱️ {meal.ready_in_minutes} mins</span>}
          {meal.servings && <span>🍽️ {meal.servings} serving(s)</span>}
        </div>
      </div>
      {meal.calories && (
        <div className="text-xs font-semibold text-saffron-400 bg-saffron-500/10 px-2 py-1 rounded-md border border-saffron-500/20 shrink-0">
          {meal.calories} kcal
        </div>
      )}
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
            <p className="text-xs text-white/40 mt-0.5">Daily Nutrition Target</p>
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