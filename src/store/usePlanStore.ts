import { create } from 'zustand'
import type { Plan, Role } from '@/types/plan'
import { planService } from '@/services/planService'

interface PlanStore {
  plan: Plan
  role: Role
  isLoading: boolean
  error: string | null

  loadPlan: (userId: string) => Promise<void>
  setPlan: (plan: Plan) => void
  reset: () => void
}

export const usePlanStore = create<PlanStore>()((set) => ({
  plan: 'free',
  role: 'user',
  isLoading: false,
  error: null,

  loadPlan: async (userId) => {
    if (!userId) return
    set({ isLoading: true, error: null })
    try {
      const { plan, role } = await planService.getUserPlan(userId)
      set({ plan, role, isLoading: false })
    } catch {
      // Fail open — default to free, never block the user
      set({ plan: 'free', role: 'user', isLoading: false })
    }
  },

  setPlan: (plan) => set({ plan }),

  reset: () => set({ plan: 'free', role: 'user', isLoading: false, error: null }),
}))
