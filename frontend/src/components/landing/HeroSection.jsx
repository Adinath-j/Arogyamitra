import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

const MockupCard = ({ children, delay, yOffset = [0, -10, 0], className }) => (
  <motion.div
    animate={{ y: yOffset }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    className={`absolute glass rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl p-4 ${className}`}
  >
    {children}
  </motion.div>
)

export default function HeroSection({ onGetStarted }) {
  return (
    <div className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-forest-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-saffron-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-forest-500/20 text-xs md:text-sm text-forest-400 mb-8 uppercase tracking-widest font-semibold">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-forest-400" />
            Meet AROMI — Your AI Health Coach
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Your Personal AI<br />
            <span className="gradient-text">Wellness Companion</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
            Personalized workouts, nutrition plans, and intelligent wellness guidance powered by advanced AI. Start your health transformation today.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-forest-500 to-forest-400 text-white font-semibold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 rounded-full glass border border-white/10 text-white font-semibold hover:bg-white/5 transition-all">
              Explore Features
            </button>
          </div>
        </motion.div>

        {/* Right Content: Floating Mockups */}
        <div className="relative h-[500px] hidden lg:block">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute inset-0"
          >
            {/* Main Dashboard Mockup */}
            <MockupCard delay={0} yOffset={[0, -15, 0]} className="w-80 left-10 top-10 z-20">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-white/20 rounded-full" />
                <Sparkles className="w-5 h-5 text-saffron-400" />
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-4/5 bg-white/10 rounded-full" />
                <div className="h-2 w-full bg-white/10 rounded-full" />
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-8 flex-1 bg-forest-500/20 border border-forest-500/30 rounded-lg" />
                <div className="h-8 flex-1 bg-white/5 rounded-lg" />
              </div>
            </MockupCard>

            {/* Chat Mockup */}
            <MockupCard delay={1.5} yOffset={[0, 15, 0]} className="w-64 right-0 top-32 z-30 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl">
              <div className="flex gap-3 items-center mb-4 border-b border-white/10 pb-3">
                <div className="w-8 h-8 rounded-full bg-forest-500/40 flex items-center justify-center text-xs">🤖</div>
                <div className="text-sm font-semibold text-white/90">AROMI</div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/10 p-2 rounded-lg rounded-tl-none w-4/5">
                  <div className="h-2 w-full bg-white/20 rounded mb-1" />
                  <div className="h-2 w-2/3 bg-white/20 rounded" />
                </div>
                <div className="bg-forest-500/20 p-2 rounded-lg rounded-tr-none w-3/4 ml-auto">
                  <div className="h-2 w-full bg-forest-400/50 rounded mb-1" />
                  <div className="h-2 w-1/2 bg-forest-400/50 rounded" />
                </div>
              </div>
            </MockupCard>

            {/* Stats Mockup */}
            <MockupCard delay={0.7} yOffset={[0, -10, 0]} className="w-48 left-0 bottom-10 z-10">
              <div className="text-xs text-white/50 mb-2">Calories Burned</div>
              <div className="text-2xl font-bold text-white mb-2">2,450 <span className="text-xs text-forest-400">+12%</span></div>
              <div className="flex items-end gap-1 h-12 mt-4">
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <div key={i} className="w-full bg-white/10 rounded-t-sm" style={{ height: `${h}%` }}>
                    {i === 5 && <div className="w-full h-full bg-forest-400 rounded-t-sm" />}
                  </div>
                ))}
              </div>
            </MockupCard>

          </motion.div>
        </div>
      </div>
    </div>
  )
}
