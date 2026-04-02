import { useEffect } from 'react'
import { useBudgetStore } from '@/store/useBudgetStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { Budget } from '@/types/budget'

export function useBudgets(transactions: { category: string; type: string; amount: number; date: string }[]) {
  const { user } = useAuthStore()
  const userId = user?.id ?? ''

  const { budgets, isLoading, error, loadBudgets, addBudget, updateBudget, removeBudget } = useBudgetStore()

  useEffect(() => {
    if (userId) loadBudgets(userId)
  }, [userId])

  /** Returns how much has been spent in a budget's month for its category. */
  function getSpent(budget: Budget): number {
    return transactions
      .filter((t) => t.type === 'expense' && t.category === budget.category && t.date.startsWith(budget.month))
      .reduce((sum, t) => sum + t.amount, 0)
  }

  function getProgress(budget: Budget): number {
    const spent = getSpent(budget)
    if (budget.limit === 0) return 0
    return Math.min((spent / budget.limit) * 100, 100)
  }

  function getStatus(budget: Budget): 'ok' | 'warning' | 'danger' {
    const pct = getProgress(budget)
    if (pct >= 100) return 'danger'
    if (pct >= 80)  return 'warning'
    return 'ok'
  }

  return {
    budgets,
    isLoading,
    error,
    getSpent,
    getProgress,
    getStatus,
    addBudget: (payload: Omit<Budget, 'id' | 'userId'>) => addBudget(userId, payload),
    updateBudget: (id: string, limit: number) => updateBudget(id, userId, limit),
    removeBudget: (id: string) => removeBudget(id, userId),
  }
}
