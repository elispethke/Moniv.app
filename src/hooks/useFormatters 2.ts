import { useSettingsStore } from '@/store/useSettingsStore'
import { getLocaleForLanguage } from '@/i18n'

function parseLocalDate(dateString: string): Date {
  const normalized = dateString.split('T')[0]
  const parts = normalized.split('-').map(Number)
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return new Date(dateString)
}

/**
 * Returns reactive formatting functions that re-render when currency/language changes.
 * Use this hook inside components instead of calling formatters.ts functions directly.
 */
export function useFormatters() {
  const currency = useSettingsStore((s) => s.currency)
  const language = useSettingsStore((s) => s.language)
  const locale = getLocaleForLanguage(language)

  function formatCurrency(value: number, currencyOverride?: string): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyOverride ?? currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(parseLocalDate(dateString))
  }

  function formatDateShort(dateString: string): string {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
    }).format(parseLocalDate(dateString))
  }

  function formatDateFull(dateString: string): string {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(parseLocalDate(dateString))
  }

  function formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`
  }

  function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value)
  }

  return { formatCurrency, formatDate, formatDateShort, formatDateFull, formatPercentage, formatCompactNumber }
}
