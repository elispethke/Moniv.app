import { describe, it, expect } from 'vitest'
import {
  calculateSummary,
  calculateCategoryTotals,
  getBalanceHistory,
  computePeriodRange,
  filterByPeriod,
} from '@/utils/calculations'
import type { Transaction } from '@/types/transaction'

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: '1',
  type: 'expense',
  amount: 100,
  description: 'Test',
  category: 'food',
  date: '2024-01-15',
  createdAt: '2024-01-15T00:00:00Z',
  ...overrides,
})

describe('calculateSummary', () => {
  it('computes income, expense, balance, and savings rate', () => {
    const txs = [
      tx({ id: '1', type: 'income', amount: 1000 }),
      tx({ id: '2', type: 'expense', amount: 300 }),
    ]
    const s = calculateSummary(txs)
    expect(s.totalIncome).toBe(1000)
    expect(s.totalExpense).toBe(300)
    expect(s.balance).toBe(700)
    expect(s.savingsRate).toBeCloseTo(70)
  })

  it('returns 0 savings rate when there is no income', () => {
    const s = calculateSummary([tx({ type: 'expense', amount: 200 })])
    expect(s.savingsRate).toBe(0)
  })
})

describe('calculateCategoryTotals', () => {
  it('aggregates expenses by category and sorts descending', () => {
    const txs = [
      tx({ id: '1', type: 'expense', amount: 50,  category: 'food' }),
      tx({ id: '2', type: 'expense', amount: 200, category: 'transport' }),
      tx({ id: '3', type: 'expense', amount: 50,  category: 'food' }),
    ]
    const totals = calculateCategoryTotals(txs)
    expect(totals[0].category).toBe('transport')
    expect(totals[0].total).toBe(200)
    expect(totals[1].category).toBe('food')
    expect(totals[1].total).toBe(100)
  })

  it('ignores income transactions', () => {
    const txs = [
      tx({ id: '1', type: 'income',  amount: 1000, category: 'salary' }),
      tx({ id: '2', type: 'expense', amount: 200,  category: 'food' }),
    ]
    const totals = calculateCategoryTotals(txs)
    expect(totals).toHaveLength(1)
    expect(totals[0].category).toBe('food')
  })
})

describe('getBalanceHistory', () => {
  it('computes running balance sorted by date', () => {
    const txs = [
      tx({ id: '1', type: 'income',  amount: 500, date: '2024-01-01' }),
      tx({ id: '2', type: 'expense', amount: 100, date: '2024-01-02' }),
      tx({ id: '3', type: 'income',  amount: 200, date: '2024-01-03' }),
    ]
    const history = getBalanceHistory(txs)
    expect(history[0]).toEqual({ date: '2024-01-01', balance: 500 })
    expect(history[1]).toEqual({ date: '2024-01-02', balance: 400 })
    expect(history[2]).toEqual({ date: '2024-01-03', balance: 600 })
  })

  it('merges multiple transactions on the same date', () => {
    const txs = [
      tx({ id: '1', type: 'income',  amount: 300, date: '2024-02-01' }),
      tx({ id: '2', type: 'expense', amount: 100, date: '2024-02-01' }),
    ]
    const history = getBalanceHistory(txs)
    expect(history).toHaveLength(1)
    expect(history[0].balance).toBe(200)
  })
})

describe('computePeriodRange', () => {
  it('returns null for all-time', () => {
    expect(computePeriodRange('all-time')).toBeNull()
  })

  it('returns null for custom without dates', () => {
    expect(computePeriodRange('custom', null, null)).toBeNull()
  })

  it('returns provided dates for custom', () => {
    const range = computePeriodRange('custom', '2024-01-01', '2024-01-31')
    expect(range).toEqual({ from: '2024-01-01', to: '2024-01-31' })
  })

  it('this-year starts from Jan 1', () => {
    const range = computePeriodRange('this-year')
    const year = new Date().getFullYear()
    expect(range?.from).toBe(`${year}-01-01`)
  })
})

describe('filterByPeriod', () => {
  const txs = [
    tx({ id: '1', date: '2024-01-10' }),
    tx({ id: '2', date: '2024-02-15' }),
    tx({ id: '3', date: '2024-03-20' }),
  ]

  it('returns all transactions for all-time', () => {
    expect(filterByPeriod(txs, 'all-time')).toHaveLength(3)
  })

  it('filters by custom date range', () => {
    const result = filterByPeriod(txs, 'custom', '2024-01-01', '2024-02-28')
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('1')
    expect(result[1].id).toBe('2')
  })
})
