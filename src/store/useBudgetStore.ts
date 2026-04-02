import { create } from 'zustand'
import type { Budget, CreateBudgetPayload } from '@/types/budget'
import { budgetService } from '@/services/budgetService'

interface BudgetStore {
  budgets: Budget[]
  isLoading: boolean
  error: string | null

  loadBudgets: (userId: string) => Promise<void>
  addBudget: (userId: string, payload: Omit<CreateBudgetPayload, 'userId'>) => Promise<void>
  updateBudget: (id: string, userId: string, limit: number) => Promise<void>
  removeBudget: (id: string, userId: string) => Promise<void>
  reset: () => void
}

export const useBudgetStore = create<BudgetStore>()((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,

  loadBudgets: async (userId) => {
    if (!userId || get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const budgets = await budgetService.getAll(userId)
      set({ budgets, isLoading: false })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar orçamentos.', isLoading: false })
    }
  },

  addBudget: async (userId, payload) => {
    const created = await budgetService.create({ ...payload, userId })
    set((s) => ({ budgets: [created, ...s.budgets] }))
  },

  updateBudget: async (id, userId, limit) => {
    const updated = await budgetService.update(id, userId, { limit })
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? updated : b)) }))
  },

  removeBudget: async (id, userId) => {
    await budgetService.remove(id, userId)
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }))
  },

  reset: () => set({ budgets: [], isLoading: false, error: null }),
}))
