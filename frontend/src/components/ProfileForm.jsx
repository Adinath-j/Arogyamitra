import { useState } from 'react'

const GOALS = [
  { value: 'weight_loss',   label: '🔥 Weight Loss',   desc: 'Burn fat, get lean' },
  { value: 'muscle_gain',   label: '💪 Muscle Gain',   desc: 'Build strength & mass' },
  { value: 'maintenance',   label: '⚖️ Maintenance',   desc: 'Stay fit & healthy' },
]

const DIETS = [
  { value: 'vegetarian',     label: '🥦 Vegetarian' },
  { value: 'non_vegetarian', label: '🍗 Non-Vegetarian' },
  { value: 'vegan',   label: '🌱 Vegan' },
]

export default function ProfileForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'male',
    goal: 'weight_loss',
    diet_type: 'veg',
    allergies: '',
    time_availability: 45,
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, age: parseInt(form.age), time_availability: parseInt(form.time_availability) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Name + Age + Gender */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">Full Name</label>
          <input
            required
            type="text"
            placeholder="Rahul Sharma"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-forest-500/60 focus:bg-white/8 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">Age</label>
          <input
            required
            type="number"
            min="10" max="100"
            placeholder="28"
            value={form.age}
            onChange={(e) => set('age', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-forest-500/60 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => set('gender', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forest-500/60 transition-all appearance-none cursor-pointer"
          >
            <option value="male"   className="bg-slate-900">Male</option>
            <option value="female" className="bg-slate-900">Female</option>
            <option value="other"  className="bg-slate-900">Other</option>
          </select>
        </div>
      </div>

      {/* Goal Selection */}
      <div>
        <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3">Your Goal</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GOALS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => set('goal', value)}
              className={`
                p-4 rounded-xl border text-left transition-all duration-200
                ${form.goal === value
                  ? 'border-forest-500/60 bg-forest-500/10 shadow-lg shadow-forest-500/10'
                  : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                }
              `}
            >
              <div className="font-medium text-sm text-white mb-1">{label}</div>
              <div className="text-xs text-white/40">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Diet Type */}
      <div>
        <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-3">Diet Type</label>
        <div className="flex gap-3 flex-wrap">
          {DIETS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => set('diet_type', value)}
              className={`
                px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
                ${form.diet_type === value
                  ? 'border-saffron-500/60 bg-saffron-500/10 text-saffron-300'
                  : 'border-white/8 text-white/50 hover:border-white/20 hover:text-white/70'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies + Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">
            Allergies / Restrictions
          </label>
          <input
            type="text"
            placeholder="e.g. peanuts, lactose, gluten"
            value={form.allergies}
            onChange={(e) => set('allergies', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-forest-500/60 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">
            Time Available / Day — <span className="text-forest-400">{form.time_availability} min</span>
          </label>
          <input
            type="range"
            min="15" max="120" step="5"
            value={form.time_availability}
            onChange={(e) => set('time_availability', e.target.value)}
            className="w-full accent-forest-400 mt-3 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/20 mt-1">
            <span>15 min</span><span>120 min</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-forest-500 to-forest-600 text-white font-semibold text-base tracking-wide hover:from-forest-400 hover:to-forest-500 transition-all duration-200 shadow-lg shadow-forest-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="spinner" />
            <span>Generating Your Plan…</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Generate My Wellness Plan</span>
          </>
        )}
      </button>
    </form>
  )
}