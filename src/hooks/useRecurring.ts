import { useEffect } from 'react'
import { useRecurringStore } from '@/store/useRecurringStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { RecurringTransaction } from '@/types/recurring'

export function useRecurring() {
  const { user } = useAuthStore()
  const userId = user?.id ?? ''

  const { items, isLoading, error, loadRecurring, addRecurring, removeRecurring } = useRecurringStore()

  useEffect(() => {
    if (userId) loadRecurring(userId)
  }, [userId])

  function getUpcoming(daysAhead = 30): RecurringTransaction[] {
    const today = new Date()
    const limit = new Date()
    limit.setDate(limit.getDate() + daysAhead)
    const todayStr = today.toISOString().slice(0, 10)
    const limitStr = limit.toISOString().slice(0, 10)
    return items.filter((r) => r.nextDate >= todayStr && r.nextDate <= limitStr)
  }

  return {
    recurring: items,
    isLoading,
    error,
    getUpcoming,
    addRecurring: (payload: Omit<RecurringTransaction, 'id' | 'userId'>) => addRecurring(userId, payload),
    removeRecurring: (id: string) => removeRecurring(id, userId),
  }
}
