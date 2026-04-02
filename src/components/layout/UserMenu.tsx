import { useEffect, useRef, useState } from 'react'
import { Settings, LogOut, ChevronDown, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { usePlanStore } from '@/store/usePlanStore'
import { useTranslation } from '@/hooks/useTranslation'
import { toUserProfile, getInitials } from '@/types/user'
import { isAdmin } from '@/lib/features'
import { cn } from '@/utils/cn'

export function UserMenu() {
  const { user, logout } = useAuthStore()
  const { openModal } = useUIStore()
  const { role } = usePlanStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const profile = user ? toUserProfile(user) : null
  const initials = profile ? getInitials(profile.fullName || profile.email) : 'F'
  const showAdmin = isAdmin(user?.email) || role === 'admin'

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-0.5 transition-all duration-200 hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User menu"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground shadow-glow-primary">
          {initials}
        </div>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-surface-border',
            'bg-surface shadow-glass animate-scale-in z-50'
          )}
        >
          {/* Profile header */}
          <div className="border-b border-surface-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {profile?.fullName ?? 'Usuário'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
          </div>

          {/* Menu items */}
          <div className="p-1">
            {showAdmin && (
              <button
                role="menuitem"
                onClick={() => { navigate('/admin'); setOpen(false) }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary transition-colors hover:bg-primary/10"
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                Admin
              </button>
            )}

            <button
              role="menuitem"
              onClick={() => { openModal('settings'); setOpen(false) }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {t('user_menu.settings')}
            </button>

            <button
              role="menuitem"
              onClick={() => { logout(); setOpen(false) }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {t('user_menu.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
