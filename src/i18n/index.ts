import en from './locales/en.json'
import pt from './locales/pt.json'
import de from './locales/de.json'

export type Language = 'en' | 'pt' | 'de'

export const SUPPORTED_LANGUAGES: { value: Language; label: string; locale: string }[] = [
  { value: 'pt', label: 'Português', locale: 'pt-BR' },
  { value: 'en', label: 'English', locale: 'en-US' },
  { value: 'de', label: 'Deutsch', locale: 'de-DE' },
]

export function getLocaleForLanguage(lang: Language): string {
  return SUPPORTED_LANGUAGES.find((l) => l.value === lang)?.locale ?? 'en-US'
}

/**
 * Detects the best supported language from the browser's preferred languages.
 * Falls back to English if no match is found.
 */
export function detectBrowserLanguage(): Language {
  const langs = navigator.languages ?? [navigator.language]
  for (const l of langs) {
    const code = l.slice(0, 2).toLowerCase() as Language
    if (SUPPORTED_LANGUAGES.some((s) => s.value === code)) return code
  }
  return 'en'
}

type TranslationRecord = Record<string, unknown>

const translations: Record<Language, TranslationRecord> = { en, pt, de }

function getNestedValue(obj: TranslationRecord, key: string): string | undefined {
  const parts = key.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as TranslationRecord)[part]
  }
  return typeof current === 'string' ? current : undefined
}

function interpolate(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`))
}

/**
 * Returns a translation function bound to the given language.
 * Falls back to English if the key is missing, then to the key itself.
 */
export function createTranslator(lang: Language) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    const raw =
      getNestedValue(translations[lang], key) ??
      getNestedValue(translations['en'], key) ??
      key
    return vars ? interpolate(raw, vars) : raw
  }
}
