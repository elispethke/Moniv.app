import { supabase } from './supabase'

export const referralService = {
  /**
   * Records that `referredUserId` signed up via `referrerId`'s link.
   *
   * Anti-fraud guards (client-side, defence-in-depth — DB is authoritative):
   *   1. Self-referral prevention
   *   2. Daily rate limit: max 5 referrals per referrer per 24 h
   *
   * On success the DB trigger `referral_reward_trigger` fires and extends
   * the referrer's `pro_expires_at` by +1 month.
   */
  async recordReferral(referrerId: string, referredUserId: string): Promise<void> {
    // 1. Self-referral guard
    if (referrerId === referredUserId) {
      console.warn('[referral] Self-referral blocked')
      return
    }

    // 2. Daily rate limit check via DB function (max 5 per 24 h)
    const { data: withinLimit, error: limitErr } = await supabase
      .rpc('check_referral_rate_limit', { p_referrer_id: referrerId })
    if (limitErr) {
      console.error('[referral] Rate limit check failed:', limitErr.message)
      return
    }
    if (!withinLimit) {
      console.warn('[referral] Referrer exceeded daily limit — skipping')
      return
    }

    // 3. Insert referral — DB trigger awards Pro to referrer automatically
    const { error } = await supabase.from('referrals').insert({
      referrer_id:      referrerId,
      referred_user_id: referredUserId,
      status:           'completed',
    })
    if (error) {
      console.error('[referral] Failed to record referral:', error.message)
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
