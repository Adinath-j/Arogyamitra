import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

// Landing components
import HeroSection from '../components/landing/HeroSection'
import AromiShowcase from '../components/landing/AromiShowcase'
import FeaturesSection from '../components/landing/FeaturesSection'
import JourneySection from '../components/landing/JourneySection'
import StatsSection from '../components/landing/StatsSection'
import OnboardingModal from '../components/landing/OnboardingModal'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()
  const { setOnboardingData } = useAuthStore()

  const handleSubmit = (formData) => {
    // Save onboarding payload to Zustand
    setOnboardingData(formData)
    setIsModalOpen(false)
    navigate('/register')
  }

  return (
    <div className="page-enter min-h-screen relative overflow-hidden bg-[#0A0A0A]">
      {/* Dark background radial gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-forest-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Landing Sections */}
      <HeroSection onGetStarted={() => setIsModalOpen(true)} />
      <AromiShowcase />
      <FeaturesSection />
      <JourneySection />
      <StatsSection />

      {/* Final CTA Section */}
      <section className="py-32 relative z-10 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform your wellness journey?</h2>
        <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">Join ArogyaMitra today and get a hyper-personalized health plan generated instantly.</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-5 rounded-full bg-gradient-to-r from-forest-500 to-forest-400 text-white text-lg font-bold hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all"
          >
            Create My Personalized Plan
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-10 py-5 rounded-full glass border border-white/10 text-white text-lg font-bold hover:bg-white/5 transition-all"
          >
            Log In
          </button>
        </div>
      </section>

      {/* Modal */}
      <OnboardingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        loading={false}
        error={''}
        step={''}
      />
    </div>
  )
}