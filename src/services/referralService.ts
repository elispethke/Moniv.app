import { supabase } from './supabase'

export const referralService = {
  /**
   * Records that `referredUserId` signed up via `referrerId`'s link.
   * Inserts a completed referral row — the backend (DB trigger / admin job)
   * is responsible for awarding 1 month Pro to the referrer.
   */
  async recordReferral(referrerId: string, referredUserId: string): Promise<void> {
    const { error } = await supabase.from('referrals').insert({
      referrer_id: referrerId,
      referred_user_id: referredUserId,
      status: 'completed',
    })
    if (error) {
      console.error('[referral] Failed to record referral:', error.message)
    }
  },

  /** Returns how many completed referrals the given user has. */
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
