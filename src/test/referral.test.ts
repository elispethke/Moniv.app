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

function mockRateLimitOk() {
  rpcMock.mockResolvedValue({ data: true, error: null })
}

function mockRateLimitExceeded() {
  rpcMock.mockResolvedValue({ data: false, error: null })
}

function mockRateLimitError() {
  rpcMock.mockResolvedValue({ data: null, error: { message: 'rpc error' } })
}

function mockInsertSuccess() {
  fromMock.mockReturnValue({
    insert: vi.fn().mockResolvedValue({ error: null }),
  })
}

function mockInsertFailure(message: string) {
  fromMock.mockReturnValue({
    insert: vi.fn().mockResolvedValue({ error: { message } }),
  })
}

function mockCount(count: number | null, error: { message: string } | null = null) {
  // Chain: supabase.from().select().eq().eq() → { count, error }
  const eqInner = vi.fn().mockResolvedValue({ count, error })
  const eqOuter = vi.fn().mockReturnValue({ eq: eqInner })
  const select  = vi.fn().mockReturnValue({ eq: eqOuter })
  fromMock.mockReturnValue({ select })
}

// ─────────────────────────────────────────────────────────────────────────────

describe('referralService.recordReferral', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    fromMock.mockReset()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('inserts a completed referral when all checks pass', async () => {
    mockRateLimitOk()
    mockInsertSuccess()

    await referralService.recordReferral('referrer-1', 'referred-1')

    expect(rpcMock).toHaveBeenCalledWith('check_referral_rate_limit', {
      p_referrer_id: 'referrer-1',
    })
    expect(fromMock).toHaveBeenCalledWith('referrals')
  })

  it('inserts with status "completed" so the DB trigger fires immediately', async () => {
    mockRateLimitOk()
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

  it('blocks self-referral without touching the DB', async () => {
    await referralService.recordReferral('same-id', 'same-id')

    expect(rpcMock).not.toHaveBeenCalled()
    expect(fromMock).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith('[referral] Self-referral blocked')
  })

  it('aborts when rate limit is exceeded', async () => {
    mockRateLimitExceeded()

    await referralService.recordReferral('referrer-1', 'referred-1')

    expect(fromMock).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith(
      '[referral] Referrer exceeded daily limit — skipping',
    )
  })

  it('aborts gracefully when the rate-limit RPC fails', async () => {
    mockRateLimitError()

    await referralService.recordReferral('referrer-1', 'referred-1')

    expect(fromMock).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(
      '[referral] Rate limit check failed:',
      'rpc error',
    )
  })

  it('logs error but does not throw when the DB insert fails', async () => {
    mockRateLimitOk()
    mockInsertFailure('duplicate key')

    await expect(
      referralService.recordReferral('referrer-1', 'referred-1'),
    ).resolves.toBeUndefined()

    expect(console.error).toHaveBeenCalledWith(
      '[referral] Failed to record referral:',
      'duplicate key',
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('referralService.getReferralCount', () => {
  beforeEach(() => {
    fromMock.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns the DB count', async () => {
    mockCount(3)
    expect(await referralService.getReferralCount('user-1')).toBe(3)
  })

  it('returns 0 when count is null', async () => {
    mockCount(null)
    expect(await referralService.getReferralCount('user-1')).toBe(0)
  })

  it('returns 0 on DB error', async () => {
    mockCount(null, { message: 'db error' })
    expect(await referralService.getReferralCount('user-err')).toBe(0)
  })

  it('returns 0 when the user has no referrals', async () => {
    mockCount(0)
    expect(await referralService.getReferralCount('user-no-refs')).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('anti-fraud: self-referral edge cases', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    fromMock.mockReset()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('blocks when referrerId === referredUserId (UUID format)', async () => {
    const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    await referralService.recordReferral(id, id)
    expect(rpcMock).not.toHaveBeenCalled()
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('proceeds when IDs are different', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null })
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    fromMock.mockReturnValue({ insert: insertMock })

    await referralService.recordReferral('id-a', 'id-b')

    expect(rpcMock).toHaveBeenCalledTimes(1)
    expect(insertMock).toHaveBeenCalledTimes(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('anti-fraud: daily rate limit', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    fromMock.mockReset()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('calls the rate-limit RPC with the correct referrer ID', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null })
    fromMock.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) })

    await referralService.recordReferral('the-referrer', 'the-referred')

    expect(rpcMock).toHaveBeenCalledWith('check_referral_rate_limit', {
      p_referrer_id: 'the-referrer',
    })
  })

  it('stops before insert when rate limit returns false', async () => {
    rpcMock.mockResolvedValue({ data: false, error: null })

    await referralService.recordReferral('referrer', 'referred')

    expect(fromMock).not.toHaveBeenCalled()
  })
})
