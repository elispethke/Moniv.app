import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '@/i18n'

export type Theme = 'dark' | 'light' | 'system'

export const CURRENCIES = [
  { value: 'BRL', label: 'BRL — R$ Real' },
  { value: 'USD', label: 'USD — $ Dollar' },
  { value: 'EUR', label: 'EUR — € Euro' },
  { value: 'GBP', label: 'GBP — £ Pound' },
  { value: 'JPY', label: 'JPY — ¥ Yen' },
  { value: 'CHF', label: 'CHF — Fr Franc' },
  { value: 'ARS', label: 'ARS — $ Peso' },
]

interface SettingsStore {
  currency: string
  language: Language
  theme: Theme
  hasOnboarded: boolean

  setCurrency: (currency: string) => void
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  setHasOnboarded: (v: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      currency: 'BRL',
      language: 'en' as Language,  // English is the default for new users
      theme: 'dark' as Theme,
      hasOnboarded: false,

      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
    }),
    {
      name: 'moniv-settings',
    }
  )
)
