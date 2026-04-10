import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useSettingsStore, CURRENCIES } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import { useTranslation } from '@/hooks/useTranslation'
import { SUPPORTED_LANGUAGES, createTranslator } from '@/i18n'
import type { Theme } from '@/store/useSettingsStore'
import type { Language } from '@/i18n'
import { cn } from '@/utils/cn'

const THEME_OPTIONS: { value: Theme; icon: React.ReactNode; labelKey: string }[] = [
  { value: 'dark',   icon: <Moon className="h-4 w-4" />,    labelKey: 'settings.theme.dark' },
  { value: 'light',  icon: <Sun className="h-4 w-4" />,     labelKey: 'settings.theme.light' },
  { value: 'system', icon: <Monitor className="h-4 w-4" />, labelKey: 'settings.theme.system' },
]

export function SettingsModal() {
  const { activeModal, closeModal } = useUIStore()
  const { currency, language, theme, setCurrency, setLanguage, setTheme } = useSettingsStore()
  const { t } = useTranslation()

  // Local draft state — nothing is committed until Save is clicked
  const [draftTheme, setDraftTheme]       = useState<Theme>(theme)
  const [draftCurrency, setDraftCurrency] = useState(currency)
  const [draftLanguage, setDraftLanguage] = useState<Language>(language)

  // Sync draft from store whenever modal opens
  useEffect(() => {
    if (activeModal === 'settings') {
      setDraftTheme(theme)
      setDraftCurrency(currency)
      setDraftLanguage(language)
    }
  }, [activeModal, theme, currency, language])

  // Save button text (and theme option labels) reflect the DRAFT language live
  const tDraft = createTranslator(draftLanguage)

  function handleSave() {
    setTheme(draftTheme)
    setCurrency(draftCurrency)
    setLanguage(draftLanguage)
    closeModal()
  }

  return (
    <Modal
      isOpen={activeModal === 'settings'}
      onClose={closeModal}
      title={t('settings.title')}
      size="sm"
    >
      <div className="space-y-6">

        {/* Theme */}
        <div>
          <p className="mb-3 text-sm font-medium text-foreground-secondary">
            {tDraft('settings.theme.label')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDraftTheme(opt.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all duration-200',
                  draftTheme === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-surface-border bg-surface-elevated text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                {opt.icon}
                <span>{tDraft(opt.labelKey)}</span>
                {draftTheme === opt.value && (
                  <Check className="absolute right-2 top-2 h-3 w-3 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <Select
          label={tDraft('settings.currency.label')}
          value={draftCurrency}
          onChange={(e) => setDraftCurrency(e.target.value)}
          options={CURRENCIES}
        />

        {/* Language */}
        <Select
          label={tDraft('settings.language.label')}
          value={draftLanguage}
          onChange={(e) => setDraftLanguage(e.target.value as Language)}
          options={SUPPORTED_LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
        />

        {/* Save — label updates live as language draft changes */}
        <Button variant="primary" fullWidth onClick={handleSave}>
          {tDraft('common.save')}
        </Button>

        {/* Legal links */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <Link
            to="/privacy"
            onClick={closeModal}
            className="text-xs text-foreground-muted hover:text-primary transition-colors"
          >
            Privacidade
          </Link>
          <span className="text-surface-border text-xs">·</span>
          <Link
            to="/terms"
            onClick={closeModal}
            className="text-xs text-foreground-muted hover:text-primary transition-colors"
          >
            Termos
          </Link>
          <span className="text-surface-border text-xs">·</span>
          <a
            href="mailto:support@moniv.app"
            className="text-xs text-foreground-muted hover:text-primary transition-colors"
          >
            Suporte
          </a>
        </div>

      </div>
    </Modal>
  )
}
