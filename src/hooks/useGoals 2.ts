import { useEffect } from 'react'
import { useGoalStore } from '@/store/useGoalStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { Goal, UpdateGoalPayload } from '@/types/goal'

export function useGoals() {
  const { user } = useAuthStore()
  const userId = user?.id ?? ''

  const { goals, isLoading, error, loadGoals, addGoal, updateGoal, removeGoal } = useGoalStore()

  useEffect(() => {
    if (userId) loadGoals(userId)
  }, [userId])

  function getProgress(goal: Goal): number {
    if (goal.targetAmount === 0) return 0
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  }

  function getMonthlyNeeded(goal: Goal): number {
    const today = new Date()
    const deadline = new Date(goal.deadline)
    const monthsLeft = Math.max(
      (deadline.getFullYear() - today.getFullYear()) * 12 +
      (deadline.getMonth() - today.getMonth()),
      1
    )
    const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
    return remaining / monthsLeft
  }

  function isOverdue(goal: Goal): boolean {
    return new Date(goal.deadline) < new Date() && goal.currentAmount < goal.targetAmount
  }

  return {
    goals,
    isLoading,
    error,
    getProgress,
    getMonthlyNeeded,
    isOverdue,
    addGoal: (payload: Omit<Goal, 'id' | 'userId'>) => addGoal(userId, payload),
    updateGoal: (id: string, fields: UpdateGoalPayload) => updateGoal(id, userId, fields),
    removeGoal: (id: string) => removeGoal(id, userId),
  }
}
