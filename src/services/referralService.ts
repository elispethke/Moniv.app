import { supabase } from './supabase'

export const referralService = {
  /**
   * Records a completed referral and rewards the referrer.
   *
   * Flow:
   *   1. Self-referral guard (client-side)
   *   2. Daily rate limit via check_referral_rate_limit RPC (max 5/day)
   *   3. Insert into referrals with status = 'completed'
   *   4. Call award_referral_pro RPC → extends profiles.pro_expires_at +30 days
   *
   * All errors are non-throwing — logged, then return early.
   */
  async recordReferral(referrerId: string, referredUserId: string): Promise<void> {
    // 1. Self-referral guard
    if (referrerId === referredUserId) {
      console.warn('[referral] Self-referral blocked')
      return
    }

    // 2. Daily rate limit (max 5 per referrer per 24 h)
    const { data: withinLimit, error: limitErr } = await supabase
      .rpc('check_referral_rate_limit', { p_referrer_id: referrerId })
    if (limitErr) {
      console.error('[referral] Rate limit check failed:', limitErr.message)
      return
    }
    if (!withinLimit) {
      console.warn('[referral] Daily limit exceeded — skipping')
      return
    }

    // 3. Insert referral row
    const { error: insertErr } = await supabase.from('referrals').insert({
      referrer_id:      referrerId,
      referred_user_id: referredUserId,
      status:           'completed',
    })
    if (insertErr) {
      console.error('[referral] Insert failed:', insertErr.message)
      return
    }

    // 4. Reward referrer: extend profiles.pro_expires_at by 30 days
    const { error: rewardErr } = await supabase
      .rpc('award_referral_pro', { p_referrer_id: referrerId })
    if (rewardErr) {
      // Non-fatal: referral recorded, but Pro reward failed.
      // Retry by re-running migration 008_award_referral_rpc.sql in Supabase.
      console.error('[referral] Reward RPC failed:', rewardErr.message)
    }

    // 5. Reward referred user: grant 30 days Pro via profiles.pro_expires_at
    //    Role is NOT changed — user remains 'user', never 'admin'.
    const referralExpiry = new Date()
    referralExpiry.setDate(referralExpiry.getDate() + 30)
    const { error: referredRewardErr } = await supabase
      .from('profiles')
      .update({ pro_expires_at: referralExpiry.toISOString() })
      .eq('id', referredUserId)
    if (referredRewardErr) {
      console.error('[referral] Referred user Pro reward failed:', referredRewardErr.message)
    }
  },

  /** Returns how many completed referrals the given user has made. */
  async getReferralCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'completed')
    if (error) return 0
    return count ?? 0
  },
}
