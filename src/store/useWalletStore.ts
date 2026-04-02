import { create } from 'zustand'
import type { Wallet, CreateWalletPayload } from '@/types/wallet'
import { walletService } from '@/services/walletService'

interface WalletStore {
  wallets: Wallet[]
  activeWalletId: string | null
  isLoading: boolean
  error: string | null

  loadWallets: (userId: string) => Promise<void>
  addWallet: (userId: string, payload: Omit<CreateWalletPayload, 'userId'>) => Promise<void>
  updateWallet: (id: string, userId: string, fields: Partial<Pick<Wallet, 'name' | 'balance'>>) => Promise<void>
  removeWallet: (id: string, userId: string) => Promise<void>
  setActiveWallet: (id: string | null) => void
  getTotalBalance: () => number
  reset: () => void
}

export const useWalletStore = create<WalletStore>()((set, get) => ({
  wallets: [],
  activeWalletId: null,
  isLoading: false,
  error: null,

  loadWallets: async (userId) => {
    if (!userId || get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const wallets = await walletService.getAll(userId)
      set({ wallets, isLoading: false })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar carteiras.', isLoading: false })
    }
  },

  addWallet: async (userId, payload) => {
    const created = await walletService.create({ ...payload, userId })
    set((s) => ({ wallets: [...s.wallets, created] }))
  },

  updateWallet: async (id, userId, fields) => {
    const updated = await walletService.update(id, userId, fields)
    set((s) => ({ wallets: s.wallets.map((w) => (w.id === id ? updated : w)) }))
  },

  removeWallet: async (id, userId) => {
    await walletService.remove(id, userId)
    set((s) => ({
      wallets: s.wallets.filter((w) => w.id !== id),
      activeWalletId: s.activeWalletId === id ? null : s.activeWalletId,
    }))
  },

  setActiveWallet: (id) => set({ activeWalletId: id }),

  getTotalBalance: () => get().wallets.reduce((sum, w) => sum + w.balance, 0),

  reset: () => set({ wallets: [], activeWalletId: null, isLoading: false, error: null }),
}))
