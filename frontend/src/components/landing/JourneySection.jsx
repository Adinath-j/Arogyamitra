import { motion } from 'framer-motion'

const STEPS = [
  { step: '01', title: 'Create your profile', desc: 'Share your age, gender, and wellness goals.' },
  { step: '02', title: 'AI analyzes your health', desc: 'Our advanced LLaMA model processes your unique requirements.' },
  { step: '03', title: 'Generate tailored plans', desc: 'Instantly receive a 7-day workout and diet plan.' },
  { step: '04', title: 'Chat with AROMI', desc: 'Get real-time answers and coaching from your AI companion.' },
  { step: '05', title: 'Track progress over time', desc: 'Log workouts and meals to watch yourself grow.' },
]

export default function JourneySection() {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-lg text-white/60">A seamless journey from setup to success.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />

          <div className="space-y-16">
            {STEPS.map((item, i) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Node */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-forest-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] -translate-x-[7px] md:-translate-x-1/2 mt-1.5 md:mt-0 z-10" />

                {/* Content */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${
                  i % 2 === 0 ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'
                }`}>
                  <div className="text-forest-400 font-bold mb-2 tracking-wider">STEP {item.step}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
                
                {/* Empty space for alternating layout on desktop */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
