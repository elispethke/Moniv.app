/**
 * Parse a date string safely as a LOCAL date (not UTC).
 *
 * Problem: `new Date("2024-01-15")` is parsed as UTC midnight, which can
 * shift to the previous day in negative-offset timezones (e.g. UTC-3).
 *
 * Solution: parse YYYY-MM-DD manually with `new Date(year, month-1, day)`.
 * This constructor always uses the local timezone.
 */
export function parseLocalDate(dateString: string): Date {
  const normalized = dateString.split('T')[0]
  const parts = normalized.split('-').map(Number)
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return new Date(dateString)
}

/**
 * Returns the YYYY-MM-DD portion of any date string.
 * Safe for both ISO timestamps and bare date strings.
 */
export function toInputDate(dateString: string): string {
  return dateString.split('T')[0]
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}
