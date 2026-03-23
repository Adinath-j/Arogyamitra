import { useState } from 'react'

const DAY_COLORS = [
  'from-forest-500/20 to-forest-600/10 border-forest-500/30',
  'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  'from-saffron-500/20 to-saffron-600/10 border-saffron-500/30',
  'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  'from-teal-500/20 to-teal-600/10 border-teal-500/30',
  'from-amber-500/20 to-amber-600/10 border-amber-500/30',
]

function ExerciseRow({ exercise }) {
  const ytUrl = exercise.youtube_search
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtube_search)}`
    : null

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-forest-400/60 group-hover:bg-forest-400 transition-colors flex-shrink-0" />
        <div>
          <span className="text-sm text-white/80 font-medium">{exercise.name}</span>
          {ytUrl && (
            <a
              href={ytUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-xs text-saffron-400/70 hover:text-saffron-400 transition-colors"
            >
              ▶ Watch
            </a>
          )}
        </div>
      </div>
      <div className="flex gap-3 text-xs text-white/40 flex-shrink-0">
        <span>{exercise.sets} sets × {exercise.reps}</span>
        <span className="text-white/20">|</span>
        <span>Rest {exercise.rest}</span>
      </div>
    </div>
  )
}

export default function WorkoutCard({ plan }) {
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
                ? 'bg-forest-500/25 text-forest-300 border border-forest-500/40'
                : 'bg-white/5 text-white/40 border border-white/8 hover:text-white/60 hover:bg-white/8'
              }
            `}
          >
            {d.day.replace('Day ', 'D')}
          </button>
        ))}
      </div>

      {/* Day card */}
      <div className={`glass rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 ${DAY_COLORS[activeDay] || DAY_COLORS[0]}`}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-semibold text-white text-lg">{today.day}</h3>
            <p className="text-sm text-white/50 mt-0.5">{today.focus}</p>
          </div>
          <span className="text-2xl">💪</span>
        </div>

        {/* Warmup */}
        {today.warmup && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/50">
            <span className="text-forest-400 font-medium">Warm-up: </span>{today.warmup}
          </div>
        )}

        {/* Exercises */}
        <div className="mb-4">
          {today.exercises?.map((ex, i) => (
            <ExerciseRow key={i} exercise={ex} />
          ))}
        </div>

        {/* Cooldown */}
        {today.cooldown && (
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/50">
            <span className="text-saffron-400 font-medium">Cool-down: </span>{today.cooldown}
          </div>
        )}
      </div>
    </div>
  )
}