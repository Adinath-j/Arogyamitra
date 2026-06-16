import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      onboardingData: null,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setOnboardingData: (data) => set({ onboardingData: data }),
      clearOnboardingData: () => set({ onboardingData: null }),
    }),
    { name: 'arogyamitra-auth' },
  ),
)