import { useEffect } from 'react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { Transaction, TransactionFilters } from '@/types/transaction'

/**
 * Primary hook for all transaction operations.
 *
 * Responsibilities:
 * - Sources userId from the auth store (components never handle auth)
 * - Triggers data load when userId becomes available or changes
 * - Wraps store actions to inject userId transparently
 *
 * Components call this hook and receive a clean, auth-agnostic API.
 */
export function useTransactions() {
  const { user } = useAuthStore()
  const userId = user?.id ?? ''

  const {
    transactions,
    summary,
    filters,
    isLoading,
    error,
    loadTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    setFilters,
    clearFilters,
    getFilteredTransactions,
  } = useTransactionStore()

  useEffect(() => {
    if (userId) {
      loadTransactions(userId)
    }
  }, [userId]) // Re-fetch whenever the authenticated user changes

  return {
    transactions,
    filteredTransactions: getFilteredTransactions(),
    summary,
    filters,
    isLoading,
    error,

    addTransaction: (payload: Omit<Transaction, 'id' | 'createdAt'>) =>
      addTransaction(userId, payload),

    updateTransaction: (
      id: string,
      payload: Partial<Omit<Transaction, 'id' | 'createdAt'>>
    ) => updateTransaction(id, userId, payload),

    removeTransaction: (id: string) => removeTransaction(id, userId),

    setFilters: (f: TransactionFilters) => setFilters(f),
    clearFilters,
    reload: () => loadTransactions(userId),
  }
}
