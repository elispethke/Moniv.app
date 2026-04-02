import { useState } from 'react'
import { exportStatementPdf } from '@/services/pdfExportService'
import { useAuthStore } from '@/store/useAuthStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { toUserProfile } from '@/types/user'
import type { Transaction, CategoryTotal } from '@/types/transaction'

interface UsePdfExportArgs {
  periodLabel: string
  transactions: Transaction[]
  categoryTotals: CategoryTotal[]
  totalIncome: number
  totalExpense: number
  balance: number
  savingsRate: number
}

export function usePdfExport(args: UsePdfExportArgs) {
  const [isExporting, setIsExporting] = useState(false)
  const { user } = useAuthStore()
  const { language, currency } = useSettingsStore()
  const profile = user ? toUserProfile(user) : null

  async function exportPdf() {
    if (isExporting) return
    setIsExporting(true)
    try {
      await exportStatementPdf({
        userName:       profile?.fullName ?? 'Utilizador',
        periodLabel:    args.periodLabel,
        totalIncome:    args.totalIncome,
        totalExpense:   args.totalExpense,
        balance:        args.balance,
        savingsRate:    args.savingsRate,
        transactions:   args.transactions,
        categoryTotals: args.categoryTotals,
        language,
        currency,
      })
    } finally {
      setIsExporting(false)
    }
  }

  return { exportPdf, isExporting }
}
