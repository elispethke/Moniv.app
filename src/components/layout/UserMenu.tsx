import { useEffect, useRef, useState } from 'react'
import {
  Settings, LogOut, ChevronDown, Shield, Users, LifeBuoy, Mail, Instagram,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { usePlanStore } from '@/store/usePlanStore'
import { useTranslation } from '@/hooks/useTranslation'
import { toUserProfile, getInitials } from '@/types/user'
import { isAdmin } from '@/lib/features'
import { CURRENCIES, useSettingsStore } from '@/store/useSettingsStore'
import { ReferralModal } from '@/features/referral/ReferralModal'
import { cn } from '@/utils/cn'

export function UserMenu() {
  const { user, logout } = useAuthStore()
  const { openModal } = useUIStore()
  const { role } = usePlanStore()
  const { t } = useTranslation()
  const { currency, setCurrency } = useSettingsStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showReferral, setShowReferral] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
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
    <>
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
              open && 'rotate-180',
            )}
          />
        </button>

        {open && (
          <div
            role="menu"
            className={cn(
              'absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-surface-border',
              'bg-surface shadow-glass animate-scale-in z-50',
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

              {/* Invite a friend */}
              <button
                role="menuitem"
                onClick={() => { setShowReferral(true); setOpen(false) }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground-secondary transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Users className="h-4 w-4 flex-shrink-0" />
                {t('user_menu.invite')}
              </button>

              {/* Settings */}
              <button
                role="menuitem"
                onClick={() => { openModal('settings'); setOpen(false) }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                {t('user_menu.settings')}
              </button>

              {/* Currency selector — inline */}
              <div className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground-secondary">
                <span className="text-sm text-muted-foreground flex-shrink-0">💱</span>
                <span className="text-sm text-foreground-secondary flex-shrink-0">
                  {t('user_menu.currency')}
                </span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="ml-auto rounded-lg border border-surface-border bg-surface-elevated px-2 py-1 text-xs font-semibold text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.value}</option>
                  ))}
                </select>
              </div>

              {/* Support */}
              <button
                role="menuitem"
                onClick={() => { setShowSupport(true); setOpen(false) }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <LifeBuoy className="h-4 w-4 flex-shrink-0" />
                {t('user_menu.support')}
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-surface-border" />

              {/* Logout */}
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

      {/* Referral modal — rendered outside the dropdown */}
      {showReferral && (
        <ReferralModal onClose={() => setShowReferral(false)} />
      )}

      {/* Support modal */}
      <Modal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        title={t('user_menu.support')}
        size="sm"
      >
        <div className="space-y-3">
          <a
            href="mailto:support@moniv.app"
            className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated p-3.5 transition-colors hover:border-primary/40 hover:bg-primary/5 active:opacity-80"
          >
            <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Email
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                support@moniv.app
              </p>
            </div>
            <svg className="ml-auto h-4 w-4 flex-shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>

          <a
            href="https://www.instagram.com/moniv.app?igsh=MTBtZnBvcHZjazlyNQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated p-3.5 transition-colors hover:border-primary/40 hover:bg-primary/5 active:opacity-80"
          >
            <Instagram className="h-5 w-5 flex-shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Instagram
              </p>
              <p className="text-sm font-semibold text-foreground">
                @moniv.app
              </p>
            </div>
            <svg className="ml-auto h-4 w-4 flex-shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </Modal>
    </>
  )
}
