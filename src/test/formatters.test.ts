import { describe, it, expect } from 'vitest'
import { parseLocalDate, toInputDate, formatPercentage } from '@/utils/formatters'

describe('parseLocalDate', () => {
  it('parses YYYY-MM-DD without UTC shift', () => {
    const d = parseLocalDate('2024-01-15')
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(0) // January
    expect(d.getDate()).toBe(15)
  })

  it('strips time portion from ISO strings', () => {
    const d = parseLocalDate('2024-06-20T10:30:00Z')
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(5) // June
    expect(d.getDate()).toBe(20)
  })
})

describe('toInputDate', () => {
  it('returns YYYY-MM-DD from a date string', () => {
    expect(toInputDate('2024-03-10')).toBe('2024-03-10')
  })

  it('strips time from ISO string', () => {
    expect(toInputDate('2024-03-10T15:00:00.000Z')).toBe('2024-03-10')
  })
})

describe('formatPercentage', () => {
  it('formats with one decimal by default', () => {
    expect(formatPercentage(32.567)).toBe('32.6%')
  })

  it('respects custom decimal count', () => {
    expect(formatPercentage(10, 0)).toBe('10%')
  })
})
