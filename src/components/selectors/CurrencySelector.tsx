import { CURRENCIES } from '@/store/useSettingsStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { cn } from '@/utils/cn'

interface Props {
  className?: string
}

export function CurrencySelector({ className }: Props) {
  const { currency, setCurrency } = useSettingsStore()

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className={cn(
        'rounded-xl border border-surface-border bg-surface/60 px-2.5 py-1.5',
        'text-[11px] font-semibold text-foreground backdrop-blur-sm appearance-none',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        className
      )}
    >
      {CURRENCIES.map((c) => (
        <option key={c.value} value={c.value}>{c.value}</option>
      ))}
    </select>
  )
}
