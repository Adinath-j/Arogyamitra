import { motion } from 'framer-motion'
import { ShieldCheck, Calendar, Activity, Cpu } from 'lucide-react'

const TRUST_INDICATORS = [
  { icon: Cpu, title: 'Built with LLaMA 3.3', desc: 'State-of-the-art open source AI models.' },
  { icon: ShieldCheck, title: 'Secure & Private', desc: 'Your health data is stored securely.' },
  { icon: Calendar, title: 'Google Calendar Sync', desc: 'Export your plans seamlessly.' },
  { icon: Activity, title: 'Personalized for India', desc: 'Desi diets and local preferences built-in.' },
]

export default function StatsSection() {
  return (
    <section className="py-24 relative z-10 border-t border-white/10 bg-gradient-to-b from-transparent to-black/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {TRUST_INDICATORS.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-16 h-16 rounded-full bg-forest-500/20 text-forest-400 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <Icon className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-white/50">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
