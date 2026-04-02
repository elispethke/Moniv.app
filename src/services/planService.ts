import { supabase } from './supabase'
import type { Plan, Role, UserPlan } from '@/types/plan'

interface PlanRow {
  user_id: string
  plan: Plan
  role: Role
}

function toPlan(row: PlanRow): UserPlan {
  return { userId: row.user_id, plan: row.plan, role: row.role ?? 'user' }
}

export const planService = {
  async getUserPlan(userId: string): Promise<UserPlan> {
    const { data, error } = await supabase
      .from('user_plans')
      .select('user_id, plan, role')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return { userId, plan: 'free', role: 'user' }
    return toPlan(data as PlanRow)
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
