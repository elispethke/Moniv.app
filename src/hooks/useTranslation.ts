import { useSettingsStore } from '@/store/useSettingsStore'
import { createTranslator } from '@/i18n'

/**
 * Returns a `t(key, vars?)` function bound to the user's selected language.
 * Re-renders the component whenever language changes.
 */
export function useTranslation() {
  const language = useSettingsStore((s) => s.language)
  return { t: createTranslator(language), language }
}
