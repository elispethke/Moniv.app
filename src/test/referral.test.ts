import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Supabase mock ─────────────────────────────────────────────────────────────
vi.mock('@/services/supabase', () => {
  return {
    supabase: {
      rpc:  vi.fn(),
      from: vi.fn(),
    },
  }
})

import { supabase } from '@/services/supabase'
import { referralService } from '@/services/referralService'

const rpcMock  = supabase.rpc  as ReturnType<typeof vi.fn>
const fromMock = supabase.from as ReturnType<typeof vi.fn>

// ── Mock builders ─────────────────────────────────────────────────────────────

/** rpc() call sequence: rate-limit → award */
function mockRpc(rateLimitData: boolean | null, rateLimitErr: null | { message: string } = null) {
  rpcMock
    .mockResolvedValueOnce({ data: rateLimitData, error: rateLimitErr }) // check_referral_rate_limit
    .mockResolvedValueOnce({ error: null })                              // award_referral_pro
}

function mockInsertOk() {
  fromMock.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) })
}

function mockInsertFail(message: string) {
  fromMock.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: { message } }) })
}

function mockCount(count: number | null, error: { message: string } | null = null) {
  const eqInner = vi.fn().mockResolvedValue({ count, error })
  const eqOuter = vi.fn().mockReturnValue({ eq: eqInner })
  fromMock.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqOuter }) })
}

// ─────────────────────────────────────────────────────────────────────────────

describe('referralService.recordReferral', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    fromMock.mockReset()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('inserts and rewards on the happy path', async () => {
    mockRpc(true)
    mockInsertOk()

    await referralService.recordReferral('referrer-1', 'referred-1')

    expect(rpcMock).toHaveBeenNthCalledWith(1, 'check_referral_rate_limit', {
      p_referrer_id: 'referrer-1',
    })
    expect(fromMock).toHaveBeenCalledWith('referrals')
    expect(rpcMock).toHaveBeenNthCalledWith(2, 'award_referral_pro', {
      p_referrer_id: 'referrer-1',
    })
  })

  it('inserts with status "completed"', async () => {
    mockRpc(true)
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    fromMock.mockReturnValue({ insert: insertMock })

    await referralService.recordReferral('ref-a', 'ref-b')

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        referrer_id:      'ref-a',
        referred_user_id: 'ref-b',
        status:           'completed',
      }),
    )
  })

  it('blocks self-referral without any DB call', async () => {
    await referralService.recordReferral('same', 'same')

    expect(rpcMock).not.toHaveBeenCalled()
    expect(fromMock).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith('[referral] Self-referral blocked')
  })

  it('aborts when daily limit exceeded', async () => {
    mockRpc(false)

    await referralService.recordReferral('r1', 'r2')

    expect(fromMock).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith('[referral] Daily limit exceeded — skipping')
  })

  it('aborts when rate-limit RPC fails', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'rpc error' } })

    await referralService.recordReferral('r1', 'r2')

    expect(fromMock).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(
      '[referral] Rate limit check failed:',
      'rpc error',
    )
  })

  it('returns without throwing when insert fails', async () => {
    mockRpc(true)
    mockInsertFail('duplicate key')

    await expect(referralService.recordReferral('r1', 'r2')).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalledWith('[referral] Insert failed:', 'duplicate key')
    // Award RPC should NOT be called if insert failed
    expect(rpcMock).toHaveBeenCalledTimes(1) // only rate-limit, not award
  })

  it('logs reward failure but does not throw', async () => {
    mockRpc(true)
    mockInsertOk()
    // Override the award_referral_pro call to fail
    rpcMock.mockResolvedValueOnce({ error: { message: 'reward failed' } })

    await expect(referralService.recordReferral('r1', 'r2')).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalledWith('[referral] Reward RPC failed:', 'reward failed')
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('referralService.getReferralCount', () => {
  beforeEach(() => {
    fromMock.mockReset()
  })

  it('returns the count from DB', async () => {
    mockCount(7)
    expect(await referralService.getReferralCount('u1')).toBe(7)
  })

  it('returns 0 when count is null', async () => {
    mockCount(null)
    expect(await referralService.getReferralCount('u1')).toBe(0)
  })

  it('returns 0 on DB error', async () => {
    mockCount(null, { message: 'db error' })
    expect(await referralService.getReferralCount('u1')).toBe(0)
  })

  it('returns 0 when user has no referrals', async () => {
    mockCount(0)
    expect(await referralService.getReferralCount('u-none')).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('anti-fraud: self-referral edge cases', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    fromMock.mockReset()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('blocks identical UUID referrals', async () => {
    const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    await referralService.recordReferral(id, id)
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('allows different UUIDs', async () => {
    rpcMock
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ error: null })
    fromMock.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) })

    await referralService.recordReferral('id-a', 'id-b')
    expect(rpcMock).toHaveBeenCalledTimes(2) // rate-limit + award
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('anti-fraud: rate limit', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    fromMock.mockReset()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('passes the correct referrer ID to the rate-limit RPC', async () => {
    rpcMock
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ error: null })
    fromMock.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) })

    await referralService.recordReferral('the-ref', 'the-new')

    expect(rpcMock).toHaveBeenNthCalledWith(1, 'check_referral_rate_limit', {
      p_referrer_id: 'the-ref',
    })
  })

  it('stops before insert when limit returns false', async () => {
    rpcMock.mockResolvedValueOnce({ data: false, error: null })

    await referralService.recordReferral('ref', 'new')
    expect(fromMock).not.toHaveBeenCalled()
  })
})
