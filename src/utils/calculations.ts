import type { Transaction, CategoryTotal, TransactionSummary } from '@/types/transaction'
import type { PeriodPreset } from '@/store/usePeriodStore'

/** Returns { from, to } as YYYY-MM-DD strings for a given preset. */
export function computePeriodRange(preset: PeriodPreset, customFrom?: string | null, customTo?: string | null): { from: string; to: string } | null {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (preset === 'all-time') return null

  if (preset === 'custom') {
    if (customFrom && customTo) return { from: customFrom, to: customTo }
    return null
  }

  if (preset === 'this-month') {
    const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
    const to = toYMD(now)
    return { from, to }
  }

  if (preset === 'last-month') {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    return { from: toYMD(d), to: toYMD(lastDay) }
  }

  if (preset === 'last-3-months') {
    const d = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    return { from: toYMD(d), to: toYMD(now) }
  }

  if (preset === 'this-year') {
    const from = `${now.getFullYear()}-01-01`
    return { from, to: toYMD(now) }
  }

  return null
}

export function filterByPeriod(transactions: Transaction[], preset: PeriodPreset, customFrom?: string | null, customTo?: string | null): Transaction[] {
  const range = computePeriodRange(preset, customFrom, customTo)
  if (!range) return transactions
  return transactions.filter((t) => t.date >= range.from && t.date <= range.to)
}

export function calculateSummary(transactions: Transaction[]): TransactionSummary {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  return { totalIncome, totalExpense, balance, savingsRate }
}

export function calculateCategoryTotals(
  transactions: Transaction[]
): CategoryTotal[] {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense')
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  const categoryMap = new Map<string, number>()

  expenseTransactions.forEach((t) => {
    const current = categoryMap.get(t.category) ?? 0
    categoryMap.set(t.category, current + t.amount)
  })

  return Array.from(categoryMap.entries())
    .map(([category, total]) => ({
      category: category as CategoryTotal['category'],
      total,
      percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
      type: 'expense' as const,
    }))
    .sort((a, b) => b.total - a.total)
}

export function groupTransactionsByMonth(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = t.date.slice(0, 7)
    acc[key] = [...(acc[key] ?? []), t]
    return acc
  }, {})
}

/**
 * Calculates the running balance at each date where a transaction occurred.
 * Useful for the balance-over-time line chart.
 */
export function getBalanceHistory(
  transactions: Transaction[]
): { date: string; balance: number }[] {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  let running = 0
  const points: { date: string; balance: number }[] = []

  for (const t of sorted) {
    running += t.type === 'income' ? t.amount : -t.amount
    const last = points[points.length - 1]
    if (last?.date === t.date) {
      last.balance = running
    } else {
      points.push({ date: t.date, balance: running })
    }
  }

  return points
}

export function getMonthlyData(transactions: Transaction[]) {
  const grouped = groupTransactionsByMonth(transactions)

  return Object.entries(grouped)
    .map(([month, txs]) => {
      const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { month, income, expense, balance: income - expense }
    })
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
}
