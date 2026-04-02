import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlanStore } from '@/store/usePlanStore'
import { isAdmin } from '@/lib/features'

/**
 * Restricts access to admin users only.
 * Admin = owner email (ADMIN_EMAILS list) OR role === 'admin' in DB.
 */
export function AdminRoute() {
  const { user, isInitialized } = useAuthStore()
  const { role } = usePlanStore()

  if (!isInitialized) return null

  const allowed = isAdmin(user?.email) || role === 'admin'
  if (!allowed) return <Navigate to="/" replace />

  return <Outlet />
}
