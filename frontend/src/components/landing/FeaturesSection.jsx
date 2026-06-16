import { motion } from 'framer-motion'

const FEATURES = [
  { icon: '🏋️', title: 'AI Workout Planning',   desc: 'Hyper-personalized routines mapped to your specific goals and schedule.' },
  { icon: '🍱', title: 'Personalized Meal Plans',  desc: 'Calorie-tracked recipes tailored to Indian cuisine and dietary preferences.' },
  { icon: '🤖', title: 'AROMI Health Coach',        desc: 'Chat with your wellness expert 24/7 for instant guidance and motivation.' },
  { icon: '📈', title: 'Progress Tracking',     desc: 'Monitor your fitness journey with beautiful charts and insights.' },
  { icon: '📅', title: 'Google Calendar Sync',     desc: 'Seamlessly integrate your workouts into your daily schedule.' },
  { icon: '🎥', title: 'Exercise Tutorials',     desc: 'Learn proper form with integrated YouTube video guides.' },
]

export default function FeaturesSection() {
  return (
    <section className="py-24 relative z-10 bg-black/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Premium Features</h2>
          <p className="text-lg text-white/60">Everything you need to transform your health, in one place.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass rounded-2xl p-8 border border-white/5 hover:border-forest-500/30 transition-colors group cursor-default"
            >
              <div className="text-4xl mb-6 bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center group-hover:bg-forest-500/20 group-hover:scale-110 transition-all">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-white/90 mb-3">{feat.title}</h3>
              <p className="text-white/50 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
