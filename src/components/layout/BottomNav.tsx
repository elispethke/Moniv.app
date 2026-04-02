import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/store/useUIStore'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlanStore } from '@/store/usePlanStore'
import { useAuthStore } from '@/store/useAuthStore'
import { isAdmin } from '@/lib/features'

export function BottomNav() {
  const { openModal } = useUIStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const plan = usePlanStore((s) => s.plan)
  const user = useAuthStore((s) => s.user)
  const email = (user as { email?: string } | null)?.email ?? null

  // Visual: show Pro style if paid OR admin
  const showProStyle = plan === 'pro' || isAdmin(email)
  // Admin always has full access — navigate to Pro hub same as a paid user
  const isPaidPro = plan === 'pro' || isAdmin(email)

  const navItems = [
    { to: '/dashboard',    icon: LayoutDashboard, label: t('nav.dashboard'),     exact: true },
    { to: '/transactions', icon: ArrowLeftRight,  label: t('nav.transactions'),  exact: false },
    { to: '/insights',     icon: Lightbulb,       label: t('nav.insights'),      exact: false },
  ]

  function handleProButton() {
    if (isPaidPro) {
      navigate('/pro/budgets')
    } else {
      openModal('upgrade')
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-border bg-background/90 backdrop-blur-md pb-safe">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground-secondary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]')} />
                <span className="text-[10px] font-medium">{item.label}</span>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-primary">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </div>
        </button>

        {/* Pro button — opens upgrade modal if not paid, pro hub if paid */}
        <button
          onClick={handleProButton}
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200',
            'text-muted-foreground hover:text-foreground-secondary'
          )}
          aria-label={isPaidPro ? t('nav.pro') : t('pro.upgrade_cta')}
        >
          <Sparkles className={cn('h-5 w-5', showProStyle && 'text-primary drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]')} />
          <span className={cn('text-[10px] font-medium', showProStyle && 'text-primary')}>
            {isPaidPro ? 'Pro' : t('nav.upgrade')}
          </span>
        </button>
      </div>
    </nav>
  )
}
