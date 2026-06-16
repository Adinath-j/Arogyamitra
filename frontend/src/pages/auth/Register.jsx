import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authApi, workoutApi, nutritionApi } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'

const GOALS    = [{ value: 'weight_loss', label: '🔥 Weight Loss' }, { value: 'muscle_gain', label: '💪 Muscle Gain' }, { value: 'maintenance', label: '⚖️ Maintenance' }, { value: 'endurance', label: '🏃 Endurance' }, { value: 'flexibility', label: '🧘 Flexibility' }]
const DIETS    = [{ value: 'vegetarian', label: '🥦 Vegetarian' }, { value: 'non_vegetarian', label: '🍗 Non-Veg' }, { value: 'vegan', label: '🌱 Vegan' }, { value: 'eggetarian', label: '🥚 Eggetarian' }]
const WORKOUTS = [{ value: 'home', label: '🏠 Home' }, { value: 'gym', label: '🏋️ Gym' }, { value: 'outdoor', label: '🌳 Outdoor' }, { value: 'mixed', label: '🔀 Mixed' }]

export default function Register() {
  const { setUser, onboardingData, clearOnboardingData } = useAuthStore()
  const navigate = useNavigate()
  
  const isCondensed = !!onboardingData

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [generationStep, setGenerationStep] = useState('')

  const [form, setForm] = useState({
    email: '', username: '', password: '', confirm_password: '', full_name: onboardingData?.full_name || '',
    age: onboardingData?.age || '', gender: onboardingData?.gender || 'male', height: onboardingData?.height || '', weight: onboardingData?.weight || '',
    fitness_level: onboardingData?.fitness_level || 'beginner', fitness_goal: onboardingData?.fitness_goal || 'weight_loss',
    workout_preference: onboardingData?.workout_preference || 'home', diet_preference: onboardingData?.diet_preference || 'vegetarian',
    allergies: onboardingData?.allergies || '', time_availability: onboardingData?.time_availability || 45,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age) : null, height: form.height ? parseFloat(form.height) : null, weight: form.weight ? parseFloat(form.weight) : null, time_availability: Number(form.time_availability) }
      delete payload.confirm_password

      setGenerationStep('Creating your account…')
      const data = await authApi.register(payload)
      
      // Update auth store with token so subsequent calls succeed
      setUser({ id: data.user_id, username: data.username, full_name: data.full_name, access_token: data.access_token })
      
      // If we came from onboarding, generate their AI plans immediately
      if (onboardingData) {
        try {
          setGenerationStep('Generating your 7-day workout plan with AI…')
          await workoutApi.generate()

          setGenerationStep('Crafting your personalized Indian meal plan…')
          await nutritionApi.generate()
        } catch (genErr) {
          console.error("Failed to generate plans during signup", genErr)
          toast.error("Account created, but plan generation failed. You can generate them later.")
        }
        clearOnboardingData()
      }

      toast.success(`Welcome to ArogyaMitra, ${data.full_name}! 🌿`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { 
      setLoading(false) 
      setGenerationStep('')
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(40,156,110,0.07)_0%,transparent_60%)] pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center text-2xl mx-auto mb-3 shadow-xl shadow-forest-500/20">🌿</div>
          <h1 className="text-xl font-bold text-white">Join ArogyaMitra</h1>
          <p className="text-white/35 text-xs mt-1">
            {isCondensed ? "Almost there! Let's secure your account." : "Your personalized wellness journey starts here"}
          </p>
        </div>

        {/* Step indicator */}
        {!isCondensed && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step >= s ? 'bg-forest-500 text-white' : 'bg-white/8 text-white/30'}`}>{s}</div>
                {s < 3 && <div className={`w-8 h-px transition-all ${step > s ? 'bg-forest-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="glass rounded-3xl border border-white/8 p-7 space-y-5 shadow-2xl">

            {generationStep && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 px-4 py-3 rounded-xl bg-forest-500/10 border border-forest-500/20 text-sm text-forest-300 flex items-center gap-3">
                <div className="spinner flex-shrink-0" />
                {generationStep}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Account Details</h3>
                
                {!isCondensed && (
                  <div>
                    <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input required type="text" placeholder="Rahul Sharma" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/18 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">Email</label>
                  <input required type="email" placeholder="rahul@example.com" value={form.email} onChange={e => set('email', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/18 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                </div>
                
                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">Username</label>
                  <input required type="text" placeholder="rahul_sharma" value={form.username} onChange={e => set('username', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/18 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password field */}
                  <div>
                    <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">Password</label>
                    <div className="relative">
                      <input required type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-11 text-white placeholder-white/18 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors focus:outline-none cursor-pointer">
                        {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password field */}
                  <div>
                    <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">Confirm</label>
                    <input required type={showPassword ? 'text' : 'password'} placeholder="Match password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/18 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                  </div>
                </div>
              </motion.div>
            )}

            {!isCondensed && step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Body Metrics</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[{ k: 'age', label: 'Age', ph: '25' }, { k: 'height', label: 'Height cm', ph: '170' }, { k: 'weight', label: 'Weight kg', ph: '70' }].map(({ k, label, ph }) => (
                    <div key={k}>
                      <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">{label}</label>
                      <input required type="number" placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/18 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Gender</label>
                  <div className="flex gap-2">
                    {['male', 'female', 'other'].map(g => (
                      <button key={g} type="button" onClick={() => set('gender', g)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${form.gender === g ? 'border-forest-500/50 bg-forest-500/15 text-forest-300' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Fitness Level</label>
                  <div className="flex gap-2">
                    {['beginner', 'intermediate', 'advanced'].map(l => (
                      <button key={l} type="button" onClick={() => set('fitness_level', l)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${form.fitness_level === l ? 'border-forest-500/50 bg-forest-500/15 text-forest-300' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {!isCondensed && step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Fitness Preferences</h3>
                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Goal</label>
                  <ToggleGroup options={GOALS} field="fitness_goal" />
                </div>
                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Diet Type</label>
                  <ToggleGroup options={DIETS} field="diet_preference" accent="saffron" />
                </div>
                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-2">Workout Location</label>
                  <ToggleGroup options={WORKOUTS} field="workout_preference" />
                </div>
                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">
                    Time Available: <span className="text-forest-400">{form.time_availability} min/day</span>
                  </label>
                  <input type="range" min="15" max="120" step="5" value={form.time_availability}
                    onChange={e => set('time_availability', parseInt(e.target.value))}
                    className="w-full accent-forest-400 cursor-pointer" />
                  <div className="flex justify-between text-xs text-white/20 mt-1"><span>15m</span><span>120m</span></div>
                </div>
                <div>
                  <label className="block text-xs text-white/35 uppercase tracking-widest mb-1.5">Allergies / Restrictions</label>
                  <input type="text" placeholder="e.g. peanuts, lactose" value={form.allergies} onChange={e => set('allergies', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/18 focus:outline-none focus:border-forest-500/50 transition-all text-sm" />
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-1">
              {!isCondensed && step > 1 && (
                <button type="button" disabled={loading} onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-all">← Back</button>
              )}
              {!isCondensed && step < 3 ? (
                <button type="button" onClick={() => setStep(s => s + 1)}
                  className="flex-1 py-3 rounded-xl bg-forest-500/20 border border-forest-500/30 text-forest-300 text-sm font-medium hover:bg-forest-500/30 transition-all">Next →</button>
              ) : (
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-forest-500 to-forest-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:from-forest-400 hover:to-forest-500 transition-all">
                  {loading ? 'Processing…' : '✨ Create Account'}
                </button>
              )}
            </div>
          </div>
        </form>
        <p className="text-center text-xs text-white/25 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-forest-400 hover:text-forest-300 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}