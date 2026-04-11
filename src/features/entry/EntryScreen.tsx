import { useNavigate } from 'react-router-dom'
import { ChevronRight, BarChart2, Shield, Zap } from 'lucide-react'
import { LanguageSelector } from '@/components/selectors/LanguageSelector'
import { CurrencySelector } from '@/components/selectors/CurrencySelector'
import { useTranslation } from '@/hooks/useTranslation'
export function EntryScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const features = [
    { icon: <BarChart2 className="h-4 w-4" />, text: t('entry.feature_1') },
    { icon: <Zap className="h-4 w-4" />, text: t('entry.feature_2') },
    { icon: <Shield className="h-4 w-4" />, text: t('entry.feature_3') },
  ]

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-background px-6 py-safe overflow-hidden">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      {/* ── Top bar: Language + Currency ─────────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-sm items-center justify-end gap-2 pt-12">
        <LanguageSelector />
        <CurrencySelector />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 text-center py-8 animate-fade-in">
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo.webp"
            alt="Moniv"
            className="h-20 w-20"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(99,102,241,0.7)) drop-shadow(0 0 8px rgba(99,102,241,0.4))' }}
          />
          <div>
            <h1 className="text-[2.75rem] font-extrabold leading-none tracking-tight text-foreground">
              Mon<span className="text-primary">iv</span>
            </h1>
            <p className="mt-2 text-base font-medium text-muted-foreground">
              {t('entry.subtitle')}
            </p>
          </div>
        </div>

        {/* Product card */}
        <div className="w-full max-w-xs rounded-3xl border border-surface-border bg-surface/50 p-5 backdrop-blur-sm text-left shadow-card">
          <p className="text-sm leading-relaxed text-foreground/80">
            {t('entry.description')}
          </p>
          <ul className="mt-4 space-y-2.5">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm space-y-3 pb-10 animate-slide-up">
        <button
          onClick={() => navigate('/login')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-4 text-base font-bold text-primary-foreground shadow-glow-primary transition-all active:scale-[0.98]"
        >
          {t('entry.cta_login')}
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="w-full rounded-2xl border border-surface-border bg-surface/60 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-surface-elevated active:scale-[0.98]"
        >
          {t('entry.cta_signup')}
        </button>
      </div>
    </div>
  )
}
