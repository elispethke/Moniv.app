import { usePlanStore } from '@/store/usePlanStore'
import { useAuthStore } from '@/store/useAuthStore'
import { isAdmin } from '@/lib/features'
import type { Plan } from '@/types/plan'

export interface UserPlanResult {
  isPro: boolean
  isAdmin: boolean
  plan: Plan
}

/**
 * Single source of truth for the current user's plan status.
 *
 * isPro  = database plan is 'pro' OR user is an admin (admin gets full access for free)
 * isAdmin = user email is in the ADMIN_EMAILS list in src/lib/features.ts
 * plan   = raw plan value from the DB ('free' | 'pro')
 *
 * Use this instead of reading usePlanStore().plan directly when you need
 * to combine plan + admin bypass in one call.
 */
export function useUserPlan(): UserPlanResult {
  const plan = usePlanStore((s) => s.plan)
  const user = useAuthStore((s) => s.user)
  const adminUser = isAdmin((user as { email?: string } | null)?.email)
  const isPro = plan === 'pro' || adminUser

  return { isPro, isAdmin: adminUser, plan }
}
