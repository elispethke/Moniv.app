import { useEffect } from 'react'
import { useInstallmentStore } from '@/store/useInstallmentStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { Installment } from '@/types/installment'

export interface InstallmentScheduleItem {
  installmentNumber: number
  totalInstallments: number
  amount: number
  dueDate: string
  isPast: boolean
}

export function useInstallments() {
  const { user } = useAuthStore()
  const userId = user?.id ?? ''

  const { installments, isLoading, error, loadInstallments, addInstallment, removeInstallment } = useInstallmentStore()

  useEffect(() => {
    if (userId) loadInstallments(userId)
  }, [userId])

  /** Generates the full payment schedule for an installment plan. */
  function getSchedule(inst: Installment): InstallmentScheduleItem[] {
    const perInstallment = inst.totalAmount / inst.totalInstallments
    const today = new Date().toISOString().slice(0, 10)

    return Array.from({ length: inst.totalInstallments }, (_, i) => {
      const date = new Date(inst.startDate)
      date.setMonth(date.getMonth() + i)
      const dueDate = date.toISOString().slice(0, 10)
      return {
        installmentNumber: i + 1,
        totalInstallments: inst.totalInstallments,
        amount: perInstallment,
        dueDate,
        isPast: dueDate < today,
      }
    })
  }

  function getCurrentInstallment(inst: Installment): number {
    const today = new Date().toISOString().slice(0, 10)
    const schedule = getSchedule(inst)
    const future = schedule.filter((s) => s.dueDate >= today)
    if (future.length === 0) return inst.totalInstallments
    return future[0].installmentNumber
  }

  function getTotalFutureCommitment(): number {
    const today = new Date().toISOString().slice(0, 10)
    return installments.reduce((sum, inst) => {
      const perInstallment = inst.totalAmount / inst.totalInstallments
      const remaining = getSchedule(inst).filter((s) => s.dueDate >= today).length
      return sum + perInstallment * remaining
    }, 0)
  }

  return {
    installments,
    isLoading,
    error,
    getSchedule,
    getCurrentInstallment,
    getTotalFutureCommitment,
    addInstallment: (payload: Omit<Installment, 'id' | 'userId'>) => addInstallment(userId, payload),
    removeInstallment: (id: string) => removeInstallment(id, userId),
  }
}
