import { create } from 'zustand'
import type { Transaction, TransactionFilters, TransactionSummary } from '@/types/transaction'
import { calculateSummary } from '@/utils/calculations'
import { transactionSupabaseService } from '@/features/transactions/services/transactionSupabaseService'
import type { CreateTransactionPayload } from '@/features/transactions/services/transactionSupabaseService'

// ─── Constants ───────────────────────────────────────────────────────────────

const EMPTY_SUMMARY: TransactionSummary = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  savingsRate: 0,
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface TransactionStore {
  transactions: Transaction[]
  filters: TransactionFilters
  summary: TransactionSummary
  isLoading: boolean
  error: string | null

  /** Fetches all transactions from Supabase for the given user. */
  loadTransactions: (userId: string) => Promise<void>

  /** Creates a transaction in Supabase and prepends it to local state. */
  addTransaction: (
    userId: string,
    payload: Omit<Transaction, 'id' | 'createdAt'>
  ) => Promise<void>

  /** Updates a transaction in Supabase and syncs local state. */
  updateTransaction: (
    id: string,
    userId: string,
    payload: Partial<Omit<Transaction, 'id' | 'createdAt'>>
  ) => Promise<void>

  /** Deletes a transaction from Supabase and removes it from local state. */
  removeTransaction: (id: string, userId: string) => Promise<void>

  setFilters: (filters: TransactionFilters) => void
  clearFilters: () => void

  /** Returns transactions with active filters applied (client-side). */
  getFilteredTransactions: () => Transaction[]

  /** Clears all state — call on logout to prevent data leaks between users. */
  reset: () => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useTransactionStore = create<TransactionStore>()((set, get) => ({
  transactions: [],
  filters: {},
  summary: EMPTY_SUMMARY,
  isLoading: false,
  error: null,

  loadTransactions: async (userId) => {
    if (!userId) return
    // Prevent duplicate concurrent fetches
    if (get().isLoading) return

    set({ isLoading: true, error: null })
    try {
      const transactions = await transactionSupabaseService.getAll(userId)
      set({
        transactions,
        summary: calculateSummary(transactions),
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao carregar transações.',
        isLoading: false,
      })
    }
  },

  addTransaction: async (userId, payload) => {
    const insertPayload: CreateTransactionPayload = {
      user_id: userId,
      type: payload.type,
      amount: payload.amount,
      category: payload.category,
      description: payload.description,
      date: payload.date,
    }

    // Throws on error — caught by the form hook's handleSubmit
    const created = await transactionSupabaseService.create(insertPayload)

    set((state) => {
      const transactions = [created, ...state.transactions]
      return { transactions, summary: calculateSummary(transactions) }
    })
  },

  updateTransaction: async (id, userId, payload) => {
    const updated = await transactionSupabaseService.update(id, userId, payload)
    set((state) => {
      const transactions = state.transactions.map((t) =>
        t.id === id ? updated : t
      )
      return { transactions, summary: calculateSummary(transactions) }
    })
  },

  removeTransaction: async (id, userId) => {
    await transactionSupabaseService.remove(id, userId)
    set((state) => {
      const transactions = state.transactions.filter((t) => t.id !== id)
      return { transactions, summary: calculateSummary(transactions) }
    })
  },

  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),

  getFilteredTransactions: () => {
    const { transactions, filters } = get()
    let result = [...transactions]

    if (filters.type && filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type)
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }

    return result.sort((a, b) => b.date.localeCompare(a.date))
  },

  reset: () =>
    set({
      transactions: [],
      summary: EMPTY_SUMMARY,
      filters: {},
      error: null,
      isLoading: false,
    }),
}))
