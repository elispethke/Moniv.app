import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserMenu } from './UserMenu'
import { ProBadge } from '@/components/ui/ProBadge'
import { LanguageSelector } from '@/components/selectors/LanguageSelector'
import { useUserPlan } from '@/hooks/useUserPlan'

export function Navbar() {
  const { isPro, isAdmin } = useUserPlan()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand — clickable, goes to dashboard */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.webp" alt="Moniv" className="h-8 w-8" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.7))' }} />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Mon<span className="text-primary">iv</span>
          </span>

          {/* Status badge — Admin takes priority, then Pro */}
          {isAdmin ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-400">
              <ShieldCheck className="h-2.5 w-2.5" />
              Admin
            </span>
          ) : isPro ? (
            <ProBadge />
          ) : null}
        </Link>

        {/* Right side: language switcher + avatar */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
