import { create } from 'zustand'
import type { RecurringTransaction, CreateRecurringPayload } from '@/types/recurring'
import { recurringService } from '@/services/recurringService'

interface RecurringStore {
  items: RecurringTransaction[]
  isLoading: boolean
  error: string | null

  loadRecurring: (userId: string) => Promise<void>
  addRecurring: (userId: string, payload: Omit<CreateRecurringPayload, 'userId'>) => Promise<void>
  removeRecurring: (id: string, userId: string) => Promise<void>
  reset: () => void
}

export const useRecurringStore = create<RecurringStore>()((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  loadRecurring: async (userId) => {
    if (!userId || get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const items = await recurringService.getAll(userId)
      set({ items, isLoading: false })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar recorrentes.', isLoading: false })
    }
  },

  addRecurring: async (userId, payload) => {
    const created = await recurringService.create({ ...payload, userId })
    set((s) => ({ items: [...s.items, created] }))
  },

  removeRecurring: async (id, userId) => {
    await recurringService.remove(id, userId)
    set((s) => ({ items: s.items.filter((r) => r.id !== id) }))
  },

  reset: () => set({ items: [], isLoading: false, error: null }),
}))
