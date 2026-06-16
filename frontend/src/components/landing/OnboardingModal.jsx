import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import ProfileForm from '../ProfileForm'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export default function OnboardingModal({ isOpen, onClose, onSubmit, loading, error, step }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl max-h-[100vh] overflow-y-auto pointer-events-auto rounded-[2rem] glass border border-white/10 glow-green relative hide-scrollbar bg-black/40"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <div className="p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Build Your Profile</h2>
                  <p className="text-sm text-white/50">
                    Tell us about yourself and we'll generate your personalized plan in seconds.
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                  >
                    ❌ {error}
                  </motion.div>
                )}

                {step && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 px-4 py-3 rounded-xl bg-forest-500/10 border border-forest-500/20 text-sm text-forest-300 flex items-center gap-3"
                  >
                    <div className="spinner flex-shrink-0" />
                    {step}
                  </motion.div>
                )}

                <ProfileForm onSubmit={onSubmit} loading={loading} />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
