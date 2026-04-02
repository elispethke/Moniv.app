import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { usePeriodStore } from '@/store/usePeriodStore'
import type { PeriodPreset } from '@/store/usePeriodStore'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'

const PRESETS: PeriodPreset[] = [
  'this-month',
  'last-month',
  'last-3-months',
  'this-year',
  'all-time',
  'custom',
]

const PRESET_KEYS: Record<PeriodPreset, string> = {
  'this-month':    'period.this_month',
  'last-month':    'period.last_month',
  'last-3-months': 'period.last_3_months',
  'this-year':     'period.this_year',
  'all-time':      'period.all_time',
  'custom':        'period.custom',
}

export function PeriodSelector() {
  const { preset, customFrom, customTo, setPreset, setCustomRange } = usePeriodStore()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [localFrom, setLocalFrom] = useState(customFrom ?? '')
  const [localTo, setLocalTo] = useState(customTo ?? '')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handlePresetClick(p: PeriodPreset) {
    if (p === 'custom') {
      setOpen(true)
      setPreset('custom')
    } else {
      setPreset(p)
      setOpen(false)
    }
  }

  function applyCustom() {
    if (localFrom && localTo && localFrom <= localTo) {
      setCustomRange(localFrom, localTo)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40"
      >
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{t(PRESET_KEYS[preset])}</span>
        {preset === 'custom' && customFrom && customTo && (
          <span className="text-xs text-muted-foreground">
            {customFrom} – {customTo}
          </span>
        )}
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-surface-border bg-surface shadow-xl">
          <div className="p-2">
            {PRESETS.filter((p) => p !== 'custom').map((p) => (
              <button
                key={p}
                onClick={() => handlePresetClick(p)}
                className={cn(
                  'w-full rounded-xl px-3 py-2 text-left text-sm transition-all',
                  preset === p
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground-secondary hover:bg-surface-elevated'
                )}
              >
                {t(PRESET_KEYS[p])}
              </button>
            ))}

            <div className="my-1 border-t border-surface-border" />

            <button
              onClick={() => handlePresetClick('custom')}
              className={cn(
                'w-full rounded-xl px-3 py-2 text-left text-sm transition-all',
                preset === 'custom'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground-secondary hover:bg-surface-elevated'
              )}
            >
              {t('period.custom')}
            </button>

            {preset === 'custom' && (
              <div className="mt-2 space-y-2 px-1 pb-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-[10px] font-medium text-muted-foreground uppercase">{t('period.from')}</p>
                    <input
                      type="date"
                      value={localFrom}
                      onChange={(e) => setLocalFrom(e.target.value)}
                      className="w-full rounded-lg border border-surface-border bg-surface-elevated px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-medium text-muted-foreground uppercase">{t('period.to')}</p>
                    <input
                      type="date"
                      value={localTo}
                      onChange={(e) => setLocalTo(e.target.value)}
                      className="w-full rounded-lg border border-surface-border bg-surface-elevated px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={applyCustom}
                  disabled={!localFrom || !localTo || localFrom > localTo}
                  className="w-full rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('common.save')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
