import { usePlanStore } from '@/store/usePlanStore'
import { useAuthStore } from '@/store/useAuthStore'
import { hasFeatureAccess } from '@/lib/features'
import type { Feature } from '@/lib/features'

/**
 * Returns whether the current user can access a given feature.
 * Applies owner override → pro plan → free limitations.
 *
 * Never check plan or email inline — always use this hook.
 */
export function useFeatureAccess(feature: Feature): boolean {
  const plan = usePlanStore((s) => s.plan)
  const user = useAuthStore((s) => s.user)
  const email = (user as { email?: string } | null)?.email ?? null
  return hasFeatureAccess(feature, plan, email)
}
