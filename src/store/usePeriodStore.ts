import { create } from 'zustand'

export type PeriodPreset =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'this-year'
  | 'all-time'
  | 'custom'

interface PeriodStore {
  preset: PeriodPreset
  customFrom: string | null  // YYYY-MM-DD
  customTo: string | null    // YYYY-MM-DD

  setPreset: (preset: PeriodPreset) => void
  setCustomRange: (from: string, to: string) => void
}

export const usePeriodStore = create<PeriodStore>((set) => ({
  preset: 'this-month',
  customFrom: null,
  customTo: null,

  setPreset: (preset) => set({ preset, customFrom: null, customTo: null }),
  setCustomRange: (from, to) => set({ preset: 'custom', customFrom: from, customTo: to }),
}))
