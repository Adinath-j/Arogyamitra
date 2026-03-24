import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Dumbbell, Salad, Heart, TrendingUp, MessageCircle, Zap, Award, Flame, Droplets, ArrowRight, Bot, Calendar } from 'lucide-react'
import { authApi, progressApi, workoutApi, nutritionApi } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.07 } } }

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl border border-white/6 p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={16} /></div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/35 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-white/20 mt-0.5">{sub}</div>}
    </motion.div>
  )
}

function QuickAction({ to, icon: Icon, label, desc, accent }) {
  return (
    <motion.div variants={fadeUp}>
      <Link to={to} className={`block glass rounded-2xl border p-5 hover:scale-[1.02] transition-all duration-200 group ${accent}`}>
        <div className="flex items-start justify-between mb-3">
          <Icon size={20} className="text-white/50 group-hover:text-white/80 transition-colors" />
          <ArrowRight size={13} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
        </div>
        <div className="text-sm font-semibold text-white/75 group-hover:text-white transition-colors">{label}</div>
        <div className="text-xs text-white/30 mt-0.5">{desc}</div>
      </Link>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user: authUser } = useAuthStore()
  const { data: profile } = useQuery({ queryKey: ['me'], queryFn: authApi.me })
  const { data: stats }   = useQuery({ queryKey: ['progress-stats'], queryFn: progressApi.stats })
  const { data: wData }   = useQuery({ queryKey: ['active-workout'], queryFn: workoutApi.getActive })
  const { data: mData }   = useQuery({ queryKey: ['active-meal'], queryFn: nutritionApi.getActive })

  const name = profile?.full_name?.split(' ')[0] || authUser?.full_name?.split(' ')[0] || 'Friend'
  const charityPts = stats?.charity_points || 0

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 py-8">

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🙏</span>
          <h1 className="text-2xl font-bold text-white">Namaste, <span className="text-forest-400">{name}</span></h1>
        </div>
        <p className="text-white/35 text-sm ml-9">
          {stats?.current_streak > 0 ? `🔥 ${stats.current_streak}-day streak — keep it up!` : 'Start your wellness journey today!'}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Flame}    label="Current Streak"  value={`${stats?.current_streak || 0}d`}      sub={`Best: ${stats?.longest_streak || 0}d`} color="bg-orange-500/15 text-orange-400" />
        <StatCard icon={Zap}      label="Calories Burned" value={Math.round(stats?.total_calories_burned || 0)} sub="all time kcal" color="bg-yellow-500/15 text-yellow-400" />
        <StatCard icon={Dumbbell} label="Total Workouts"  value={stats?.total_workouts || 0}              sub="sessions"           color="bg-forest-500/15 text-forest-400" />
        <StatCard icon={Award}    label="Charity Points"  value={charityPts}                              sub={`≈ ${Math.floor(charityPts / 50)} trees`} color="bg-saffron-500/15 text-saffron-400" />
      </motion.div>

      {/* Charity banner */}
      {charityPts > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-forest-500/20 bg-gradient-to-r from-forest-500/8 to-saffron-500/5 p-5 mb-8 flex items-center gap-4">
          <div className="text-3xl">🌳</div>
          <div>
            <div className="text-sm font-semibold text-white">Your Fitness is Making a Difference!</div>
            <div className="text-xs text-white/40 mt-0.5">
              {Math.floor(charityPts / 10)} km donated · {Math.floor(charityPts / 50)} trees planted · {charityPts} charity points
            </div>
          </div>
        </motion.div>
      )}

      {/* Plan status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          { has: !!wData?.plan, label: 'Workout Plan', icon: Dumbbell, to: '/workouts', border: 'border-forest-500/20', desc: wData?.plan ? `Active 7-day plan` : 'No plan yet — generate one!' },
          { has: !!mData?.plan, label: 'Meal Plan',    icon: Salad,    to: '/nutrition', border: 'border-saffron-500/20', desc: mData?.plan ? `Active Indian meal plan` : 'No plan yet — generate one!' },
        ].map(({ has, label, icon: Icon, to, border, desc }) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="show">
            <Link to={to} className={`block glass rounded-2xl border ${border} p-5 hover:scale-[1.01] transition-all group`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Icon size={15} className="text-white/45" /><span className="text-sm font-medium text-white/65">{label}</span></div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${has ? 'border-forest-500/30 bg-forest-500/10 text-forest-400' : 'border-white/10 text-white/25'}`}>{has ? 'Active' : 'None'}</span>
              </div>
              <p className="text-xs text-white/30">{desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Quick Actions</h2>
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickAction to="/workouts"  icon={Dumbbell}     label="Workouts"     desc="View & track"    accent="border-forest-500/15 hover:border-forest-500/30" />
          <QuickAction to="/nutrition" icon={Salad}        label="Nutrition"    desc="Meal plans"      accent="border-saffron-500/15 hover:border-saffron-500/30" />
          <QuickAction to="/health"    icon={Heart}        label="Health Check" desc="AI assessment"   accent="border-pink-500/15 hover:border-pink-500/30" />
          <QuickAction to="/progress"  icon={TrendingUp}   label="Progress"     desc="Charts & logs"   accent="border-blue-500/15 hover:border-blue-500/30" />
          <QuickAction to="/chat"      icon={Bot}          label="AROMI AI"     desc="Chat with coach" accent="border-purple-500/15 hover:border-purple-500/30" />
          <QuickAction to="/progress"  icon={Calendar}     label="Log Today"    desc="Record metrics"  accent="border-teal-500/15 hover:border-teal-500/30" />
        </motion.div>
      </div>

      {/* 30-day summary */}
      {stats?.last_30_days && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-white/6 p-5">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Last 30 Days</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Sessions',      value: stats.last_30_days.sessions,                              icon: Dumbbell  },
              { label: 'Kcal Burned',   value: `${Math.round(stats.last_30_days.calories_burned)} kcal`, icon: Flame     },
              { label: 'Workout Mins',  value: `${stats.last_30_days.workout_minutes} min`,              icon: Zap       },
              { label: 'Avg Sleep',     value: `${stats.last_30_days.avg_sleep_hours}h`,                 icon: Droplets  },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={14} className="text-white/25 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-white">{value}</div>
                  <div className="text-xs text-white/30">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}