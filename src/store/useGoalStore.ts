import { create } from 'zustand'
import type { Goal, CreateGoalPayload, UpdateGoalPayload } from '@/types/goal'
import { goalService } from '@/services/goalService'

interface GoalStore {
  goals: Goal[]
  isLoading: boolean
  error: string | null

  loadGoals: (userId: string) => Promise<void>
  addGoal: (userId: string, payload: Omit<CreateGoalPayload, 'userId'>) => Promise<void>
  updateGoal: (id: string, userId: string, fields: UpdateGoalPayload) => Promise<void>
  removeGoal: (id: string, userId: string) => Promise<void>
  reset: () => void
}

export const useGoalStore = create<GoalStore>()((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  loadGoals: async (userId) => {
    if (!userId || get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const goals = await goalService.getAll(userId)
      set({ goals, isLoading: false })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar metas.', isLoading: false })
    }
  },

  addGoal: async (userId, payload) => {
    const created = await goalService.create({ ...payload, userId })
    set((s) => ({ goals: [...s.goals, created] }))
  },

  updateGoal: async (id, userId, fields) => {
    const updated = await goalService.update(id, userId, fields)
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? updated : g)) }))
  },

  removeGoal: async (id, userId) => {
    await goalService.remove(id, userId)
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
  },

  reset: () => set({ goals: [], isLoading: false, error: null }),
}))
