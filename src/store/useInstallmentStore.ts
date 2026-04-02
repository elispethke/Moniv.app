import { create } from 'zustand'
import type { Installment, CreateInstallmentPayload } from '@/types/installment'
import { installmentService } from '@/services/installmentService'

interface InstallmentStore {
  installments: Installment[]
  isLoading: boolean
  error: string | null

  loadInstallments: (userId: string) => Promise<void>
  addInstallment: (userId: string, payload: Omit<CreateInstallmentPayload, 'userId'>) => Promise<void>
  removeInstallment: (id: string, userId: string) => Promise<void>
  reset: () => void
}

export const useInstallmentStore = create<InstallmentStore>()((set, get) => ({
  installments: [],
  isLoading: false,
  error: null,

  loadInstallments: async (userId) => {
    if (!userId || get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const installments = await installmentService.getAll(userId)
      set({ installments, isLoading: false })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar parcelamentos.', isLoading: false })
    }
  },

  addInstallment: async (userId, payload) => {
    const created = await installmentService.create({ ...payload, userId })
    set((s) => ({ installments: [created, ...s.installments] }))
  },

  removeInstallment: async (id, userId) => {
    await installmentService.remove(id, userId)
    set((s) => ({ installments: s.installments.filter((i) => i.id !== id) }))
  },

  reset: () => set({ installments: [], isLoading: false, error: null }),
}))
