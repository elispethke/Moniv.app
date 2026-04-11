import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useSettingsStore } from '@/store/useSettingsStore'

/** Full-screen spinner shown while the initial session check is in flight. */
function AppLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <img
        src="/logo.webp"
        alt="Moniv"
        className="h-14 w-14 animate-pulse-slow"
        style={{ filter: 'drop-shadow(0 4px 16px rgba(99,102,241,0.65)) drop-shadow(0 0 6px rgba(99,102,241,0.4))' }}
      />
      <div className="h-1 w-24 overflow-hidden rounded-full bg-surface-elevated">
        <div className="h-full w-full animate-shimmer rounded-full bg-gradient-primary bg-[length:200%_100%]" />
      </div>
    </div>
  )
}

/**
 * Wraps private routes. Redirects to /login when unauthenticated.
 * Shows a loading screen while the initial session hydration is pending.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore()
  const { hasOnboarded } = useSettingsStore()
  const { pathname } = useLocation()

  if (!isInitialized) return <AppLoader />
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (!hasOnboarded && pathname !== '/onboarding') return <Navigate to="/onboarding" replace />

  return <Outlet />
}

/**
 * Wraps public-only routes (login, signup).
 * Redirects to / when the user is already authenticated.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore()

  if (!isInitialized) return <AppLoader />
  if (isAuthenticated) return <Navigate to="/transactions" replace />

  return <Outlet />
}
