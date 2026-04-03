/**
 * Tests for the financial data calculation logic used in useShareSnapshot.
 *
 * The canvas rendering itself is not tested here (browser-only API).
 * We validate the data pipeline: transactions → totals → savingsRate.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Transaction } from '@/types/transaction'
import { filterByPeriod } from '@/utils/calculations'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = '2024-06-15'

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id:          'id-' + Math.random(),
    type:        'expense',
    amount:      100,
    description: 'Test',
    category:    'food',
    date:        TODAY,
    createdAt:   `${TODAY}T00:00:00Z`,
    ...overrides,
  }
}

/** Replicates the exact calculation logic from useShareSnapshot's getSnapshotData(). */
function calcSnapshot(transactions: Transaction[]) {
  const totalIncome  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
  return { totalIncome, totalExpense, balance, savingsRate }
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.useRealTimers()
})

// ── Tests: totals ─────────────────────────────────────────────────────────────

describe('snapshot data: income / expense totals', () => {
  it('sums income correctly', () => {
    const txs = [tx({ type: 'income', amount: 1000 }), tx({ type: 'income', amount: 500 })]
    expect(calcSnapshot(txs).totalIncome).toBe(1500)
  })

  it('sums expenses correctly', () => {
    const txs = [tx({ amount: 200 }), tx({ amount: 300 })]
    expect(calcSnapshot(txs).totalExpense).toBe(500)
  })

  it('calculates positive balance', () => {
    const txs = [tx({ type: 'income', amount: 2000 }), tx({ amount: 800 })]
    expect(calcSnapshot(txs).balance).toBe(1200)
  })

  it('calculates negative balance', () => {
    const txs = [tx({ type: 'income', amount: 500 }), tx({ amount: 900 })]
    expect(calcSnapshot(txs).balance).toBe(-400)
  })

  it('returns zero balance with no transactions', () => {
    expect(calcSnapshot([]).balance).toBe(0)
  })
})

// ── Tests: savings rate ───────────────────────────────────────────────────────

describe('snapshot data: savings rate', () => {
  it('calculates savings rate as percentage', () => {
    const txs = [tx({ type: 'income', amount: 1000 }), tx({ amount: 200 })]
    expect(calcSnapshot(txs).savingsRate).toBeCloseTo(80, 1)
  })

  it('returns 0% when income is zero', () => {
    expect(calcSnapshot([tx({ amount: 500 })]).savingsRate).toBe(0)
  })

  it('returns 100% with income and no expenses', () => {
    expect(calcSnapshot([tx({ type: 'income', amount: 1000 })]).savingsRate).toBe(100)
  })

  it('returns negative savings rate when expenses exceed income', () => {
    const txs = [tx({ type: 'income', amount: 500 }), tx({ amount: 900 })]
    expect(calcSnapshot(txs).savingsRate).toBeLessThan(0)
  })
})

// ── Tests: period filtering ───────────────────────────────────────────────────

describe('snapshot data: period filtering', () => {
  const june = tx({ date: '2024-06-15', type: 'income', amount: 1000 })
  const may  = tx({ date: '2024-05-10', type: 'income', amount: 500 })
  const all  = [june, may]

  it('filterByPeriod("this_month") keeps only current-month transactions', () => {
    vi.setSystemTime(new Date('2024-06-20'))
    const filtered = filterByPeriod(all, 'this_month')
    expect(filtered.some((t) => t.date === '2024-06-15')).toBe(true)
    expect(filtered.some((t) => t.date === '2024-05-10')).toBe(false)
  })

  it('filterByPeriod("all_time") returns all transactions', () => {
    const filtered = filterByPeriod(all, 'all_time')
    expect(filtered).toHaveLength(2)
  })

  it('filterByPeriod("custom") respects from/to dates', () => {
    const filtered = filterByPeriod(all, 'custom', '2024-06-01', '2024-06-30')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].date).toBe('2024-06-15')
  })
})
