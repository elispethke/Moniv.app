import { useEffect } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'

/**
 * Applies the `.light` class to <html> when the theme is light.
 * Dark is the CSS default (:root) — no class needed.
 *
 * Strategy: dark = default (:root), light = .light on <html>.
 * "system" resolves via prefers-color-scheme and subscribes to changes.
 *
 * Call once at app root.
 */
export function useTheme() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    function apply(isLight: boolean) {
      root.classList.toggle('light', isLight)
    }

    if (theme === 'system') {
      // system default is dark unless OS says otherwise
      const mq = window.matchMedia('(prefers-color-scheme: light)')
      apply(mq.matches)
      const handler = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    apply(theme === 'light')
  }, [theme])
}

/**
 * Returns true when the resolved theme is dark.
 * Used by chart libraries that need actual color values, not CSS variables.
 */
export function useIsDark(): boolean {
  const theme = useSettingsStore((s) => s.theme)
  if (theme === 'dark') return true
  if (theme === 'light') return false
  // system: dark unless OS prefers light
  if (typeof window !== 'undefined') {
    return !window.matchMedia('(prefers-color-scheme: light)').matches
  }
  return true
}
