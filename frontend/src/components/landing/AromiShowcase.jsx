import { motion } from 'framer-motion'
import AromiAvatar from '../AromiAvatar'

export default function AromiShowcase() {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Meet AROMI</h2>
          <p className="text-lg text-white/60">Your 24/7 AI wellness coach, always ready to help.</p>
        </div>

        <div className="glass rounded-[2rem] p-6 md:p-10 border border-white/10 glow-saffron relative">
          <div className="flex flex-col gap-6">
            
            {/* User Message */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="self-end max-w-[80%] flex flex-col items-end"
            >
              <div className="bg-white/10 text-white rounded-2xl rounded-tr-sm px-5 py-3 text-sm md:text-base border border-white/5">
                How much water should I drink today?
              </div>
              <div className="text-xs text-white/40 mt-1 mr-1">You</div>
            </motion.div>

            {/* Aromi Message */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.5 }}
              className="self-start max-w-[85%] flex items-end gap-3"
            >
              <AromiAvatar size={40} className="mb-5" />
              <div className="flex flex-col">
                <div className="bg-forest-500/20 text-white rounded-2xl rounded-tl-sm px-5 py-4 text-sm md:text-base border border-forest-500/30 leading-relaxed">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    viewport={{ once: true }}
                  >
                    Based on your weight and activity level, I recommend approximately <strong className="text-forest-300">2.1 liters</strong> today. I've added a reminder to your schedule!
                  </motion.span>
                </div>
                <div className="text-xs text-forest-400 mt-1 ml-1 font-semibold">AROMI</div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
