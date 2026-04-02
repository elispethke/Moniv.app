import { SUPPORTED_LANGUAGES, type Language } from '@/i18n'
import { useSettingsStore } from '@/store/useSettingsStore'
import { cn } from '@/utils/cn'

interface Props {
  className?: string
}

export function LanguageSelector({ className }: Props) {
  const { language, setLanguage } = useSettingsStore()

  return (
    <div className={cn(
      'flex items-center gap-1 rounded-xl border border-surface-border bg-surface/60 p-1 backdrop-blur-sm',
      className
    )}>
      {SUPPORTED_LANGUAGES.map((l) => (
        <button
          key={l.value}
          onClick={() => setLanguage(l.value as Language)}
          className={cn(
            'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all',
            language === l.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {l.value.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
