import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'

const GOALS    = [{ value: 'weight_loss', label: '🔥 Weight Loss' }, { value: 'muscle_gain', label: '💪 Muscle Gain' }, { value: 'maintenance', label: '⚖️ Maintenance' }, { value: 'endurance', label: '🏃 Endurance' }, { value: 'flexibility', label: '🧘 Flexibility' }]
const DIETS    = [{ value: 'vegetarian', label: '🥦 Vegetarian' }, { value: 'non_vegetarian', label: '🍗 Non-Veg' }, { value: 'vegan', label: '🌱 Vegan' }, { value: 'eggetarian', label: '🥚 Eggetarian' }]
const WORKOUTS = [{ value: 'home', label: '🏠 Home' }, { value: 'gym', label: '🏋️ Gym' }, { value: 'outdoor', label: '🌳 Outdoor' }, { value: 'mixed', label: '🔀 Mixed' }]

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { setUser, user } = useAuthStore()
  
  const [form, setForm] = useState({
    full_name: '', age: '', gender: 'male', height: '', weight: '',
    fitness_level: 'beginner', fitness_goal: 'weight_loss',
    workout_preference: 'home', diet_preference: 'vegetarian',
    allergies: '', time_availability: 45,
  })

  useEffect(() => {
    authApi.me()
      .then(data => {
        setForm({
          full_name: data.full_name || '',
          age: data.age || '',
          gender: data.gender || 'male',
          height: data.height || '',
          weight: data.weight || '',
          fitness_level: data.fitness_level || 'beginner',
          fitness_goal: data.fitness_goal || data.goal || 'weight_loss',
          workout_preference: data.workout_preference || 'home',
          diet_preference: data.diet_preference || data.diet_type || 'vegetarian',
          allergies: data.allergies || '',
          time_availability: data.time_availability || 45,
        })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        time_availability: Number(form.time_availability)
      }
      const updatedUser = await authApi.updateProfile(payload)
      // Only update local full_name if it changed
      if (user.full_name !== updatedUser.full_name) {
        setUser({ ...user, full_name: updatedUser.full_name })
      }
      toast.success('Profile updated successfully! 🌿')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const ToggleGroup = ({ options, field, accent = 'forest' }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => (
        <button key={value} type="button" onClick={() => set(field, value)}
          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all
            ${form[field] === value
              ? accent === 'saffron' ? 'border-saffron-500/50 bg-saffron-500/12 text-saffron-300' : 'border-forest-500/50 bg-forest-500/12 text-forest-300'
              : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
          {label}
        </button>
      ))}
    </div>
  )

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="spinner !w-8 !h-8 border-forest-500/30 border-t-forest-500" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(40,156,110,0.08)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Profile</h1>
          <p className="text-white/40 text-sm mt-1">Keep your body metrics and preferences up to date</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Info Module */}
            <div className="glass rounded-3xl border border-white/5 p-6 space-y-5">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <span className="text-forest-400">👤</span> Personal Details
              </h3>
              
              <div>
                <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">Full Name</label>
                <input required type="text" placeholder="Your Name" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[{ k: 'age', label: 'Age' }, { k: 'height', label: 'Height(cm)' }, { k: 'weight', label: 'Weight(kg)' }].map(({ k, label }) => (
                  <div key={k}>
                    <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">{label}</label>
                    <input type="number" value={form[k]} onChange={e => set(k, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Gender</label>
                <div className="flex gap-2">
                  {['male', 'female', 'other'].map(g => (
                    <button key={g} type="button" onClick={() => set('gender', g)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${form.gender === g ? 'border-forest-500/50 bg-forest-500/15 text-forest-300' : 'border-white/10 text-white/40 hover:bg-white/5'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Assessment Module */}
            <div className="glass rounded-3xl border border-white/5 p-6 space-y-5">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <span className="text-[#FBBF24]">🎯</span> Fitness Assessment
              </h3>

              <div>
                <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Primary Goal</label>
                <ToggleGroup options={GOALS} field="fitness_goal" />
              </div>

              <div>
                <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Fitness Level</label>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map(l => (
                    <button key={l} type="button" onClick={() => set('fitness_level', l)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${form.fitness_level === l ? 'border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#FBBF24]' : 'border-white/10 text-white/40 hover:bg-white/5'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Daily Time Available</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="15" max="120" step="5" value={form.time_availability}
                    onChange={e => set('time_availability', parseInt(e.target.value))}
                    className="flex-1 accent-forest-400 cursor-pointer" />
                  <span className="text-sm font-medium text-forest-300 bg-forest-500/10 px-3 py-1 rounded-lg border border-forest-500/20">{form.time_availability}m</span>
                </div>
              </div>
            </div>

            {/* Preferences Module */}
            <div className="glass rounded-3xl border border-white/5 p-6 space-y-5 md:col-span-2">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <span className="text-[#60A5FA]">⚙️</span> Lifestyle Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Diet Type</label>
                  <ToggleGroup options={DIETS} field="diet_preference" accent="saffron" />
                  
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5 mt-5">Allergies / Restrictions</label>
                  <input type="text" placeholder="e.g. lactose, gluten, nuts" value={form.allergies} onChange={e => set('allergies', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Workout Location</label>
                  <ToggleGroup options={WORKOUTS} field="workout_preference" />
                  <p className="text-[11px] text-white/30 mt-2">
                    {form.workout_preference === 'home' && '* ArogyaMitra will only suggest bodyweight and household items for your workouts.'}
                    {form.workout_preference === 'gym' && '* ArogyaMitra will suggest fully equipped gym workouts.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-forest-500 to-forest-600 text-white font-semibold shadow-lg shadow-forest-500/20 hover:shadow-forest-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2">
              {saving ? <><div className="spinner !w-4 !h-4" /> Saving...</> : 'Save Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
