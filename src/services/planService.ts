import { supabase } from './supabase'
import type { Plan, Role, UserPlan } from '@/types/plan'

interface PlanRow {
  user_id: string
  plan: Plan
  role: Role
}

interface ProfileRow {
  pro_expires_at: string | null
}

function toPlan(row: PlanRow): UserPlan {
  return { userId: row.user_id, plan: row.plan, role: row.role ?? 'user' }
}

export const planService = {
  /**
   * Resolves the effective plan for a user, considering both:
   *   - user_plans.plan  → Stripe subscription (persistent Pro)
   *   - profiles.pro_expires_at → Referral reward (time-limited Pro)
   *
   * Rules:
   *   • Stripe Pro (plan = 'pro')  → always Pro, ignores expiry
   *   • Referral Pro (plan = 'free' but pro_expires_at > now()) → Pro
   *   • Referral expired (pro_expires_at <= now()) → Free
   */
  async getUserPlan(userId: string): Promise<UserPlan> {
    const [planResult, profileResult] = await Promise.all([
      supabase
        .from('user_plans')
        .select('user_id, plan, role')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('pro_expires_at')
        .eq('id', userId)
        .maybeSingle(),
    ])

    if (planResult.error) throw new Error(planResult.error.message)

    const planRow = planResult.data as PlanRow | null
    const profile = profileResult.data as ProfileRow | null

    // Base plan from user_plans (Stripe subscription)
    const base: UserPlan = planRow
      ? toPlan(planRow)
      : { userId, plan: 'free', role: 'user' }

    // Stripe Pro is always valid — no expiry check needed
    if (base.plan === 'pro') return base

    // Check referral-based Pro from profiles.pro_expires_at
    if (profile?.pro_expires_at) {
      const expiresAt = new Date(profile.pro_expires_at)
      if (expiresAt > new Date()) {
        return { ...base, plan: 'pro' }
      }
    }

    return base
  },

  async upsertPlan(userId: string, plan: Plan): Promise<UserPlan> {
    const { data, error } = await supabase
      .from('user_plans')
      .upsert({ user_id: userId, plan }, { onConflict: 'user_id' })
      .select('user_id, plan, role')
      .single()

    if (error) throw new Error(error.message)
    return toPlan(data as PlanRow)
  },

  /**
   * Immediately grants Pro to a user — use for testing without going through Stripe.
   * Writes directly to user_plans via the client (subject to RLS; user must be authed).
   */
  async upgradeToPro(userId: string): Promise<void> {
    await planService.upsertPlan(userId, 'pro')
  },
}
