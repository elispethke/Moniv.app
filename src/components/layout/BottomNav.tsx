import { useRef, useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/store/useUIStore'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlanStore } from '@/store/usePlanStore'
import { useAuthStore } from '@/store/useAuthStore'
import { isAdmin } from '@/lib/features'

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, labelKey: 'nav.dashboard',    exact: true  },
  { to: '/transactions', icon: ArrowLeftRight,  labelKey: 'nav.transactions', exact: false },
  { to: '/insights',     icon: Lightbulb,       labelKey: 'nav.insights',     exact: false },
] as const

export function BottomNav() {
  const { openModal } = useUIStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const plan  = usePlanStore((s) => s.plan)
  const user  = useAuthStore((s) => s.user)
  const email = (user as { email?: string } | null)?.email ?? null

  const showProStyle = plan === 'pro' || isAdmin(email)
  const isPaidPro    = plan === 'pro' || isAdmin(email)

  // Which nav link is currently active (0 | 1 | 2 | -1)
  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to)
  )

  // ── Dynamic indicator via DOM measurement ──────────────────────────────────
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null)

  function measureActive() {
    const el = activeIndex >= 0 ? itemRefs.current[activeIndex] : null
    if (!el) {
      setIndicatorStyle(null)
      return
    }
    setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth })
  }

  // Re-measure whenever active route changes
  useEffect(() => {
    measureActive()
  }, [activeIndex])

  // Re-measure on viewport resize
  useEffect(() => {
    window.addEventListener('resize', measureActive)
    return () => window.removeEventListener('resize', measureActive)
  }, [activeIndex])

  function handleProButton() {
    if (isPaidPro) {
      navigate('/pro/budgets')
    } else {
      openModal('upgrade')
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-border bg-background/90 backdrop-blur-md pb-safe">
      <div className="mx-auto max-w-md relative">
        {/* ── Animated active indicator pill — DOM-measured position ─────────── */}
        {indicatorStyle && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-10 -translate-y-1/2 rounded-xl bg-primary/10"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              transition: 'left 250ms ease, width 250ms ease',
            }}
          />
        )}

        <div className="flex h-16 items-center justify-around px-2">
          {NAV_ITEMS.map((item, idx) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              ref={(el) => { itemRefs.current[idx] = el }}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground-secondary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-all duration-200',
                      isActive && 'drop-shadow-[0_0_8px_rgba(99,102,241,0.9)] scale-110'
                    )}
                  />
                  <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Add transaction */}
          <button
            onClick={() => openModal('add-transaction')}
            className="flex flex-col items-center gap-0.5 px-3 py-2"
            aria-label={t('nav.add')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-primary transition-transform duration-200 active:scale-95">
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
          </button>

          {/* Pro / Upgrade button */}
          <button
            onClick={handleProButton}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200',
              'text-muted-foreground hover:text-foreground-secondary'
            )}
            aria-label={isPaidPro ? t('nav.pro') : t('pro.upgrade_cta')}
          >
            <Sparkles
              className={cn(
                'h-5 w-5 transition-all duration-200',
                showProStyle && 'text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.9)]'
              )}
            />
            <span className={cn('text-[10px] font-medium', showProStyle && 'text-primary')}>
              {isPaidPro ? 'Pro' : t('nav.upgrade')}
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}
