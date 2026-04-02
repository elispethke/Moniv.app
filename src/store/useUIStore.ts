import { create } from 'zustand'

type ActiveModal = 'add-transaction' | 'edit-transaction' | 'delete-confirm' | 'settings' | 'upgrade' | null

interface UIStore {
  activeModal: ActiveModal
  selectedTransactionId: string | null
  isSidebarOpen: boolean

  openModal: (modal: ActiveModal, transactionId?: string) => void
  closeModal: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeModal: null,
  selectedTransactionId: null,
  isSidebarOpen: false,

  openModal: (modal, transactionId) =>
    set({ activeModal: modal, selectedTransactionId: transactionId ?? null }),
  closeModal: () => set({ activeModal: null, selectedTransactionId: null }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
