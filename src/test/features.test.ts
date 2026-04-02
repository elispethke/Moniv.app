import { describe, it, expect } from 'vitest'
import { isAdmin, isOwner, hasFeatureAccess, FEATURES } from '@/lib/features'

describe('isAdmin', () => {
  it('returns true for the owner email', () => {
    expect(isAdmin('elispethke@gmail.com')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isAdmin('ELISPETHKE@GMAIL.COM')).toBe(true)
    expect(isAdmin('Elispethke@Gmail.Com')).toBe(true)
  })

  it('returns false for an unknown email', () => {
    expect(isAdmin('user@gmail.com')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isAdmin(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isAdmin(undefined)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isAdmin('')).toBe(false)
  })
})

describe('isOwner (deprecated alias)', () => {
  it('behaves identically to isAdmin', () => {
    expect(isOwner('elispethke@gmail.com')).toBe(true)
    expect(isOwner('other@gmail.com')).toBe(false)
  })
})

describe('hasFeatureAccess', () => {
  it('grants access to admin regardless of plan', () => {
    for (const feature of Object.values(FEATURES)) {
      expect(hasFeatureAccess(feature, 'free', 'elispethke@gmail.com')).toBe(true)
    }
  })

  it('grants access to pro user for all features', () => {
    for (const feature of Object.values(FEATURES)) {
      expect(hasFeatureAccess(feature, 'pro')).toBe(true)
    }
  })

  it('blocks free user from pro-only features', () => {
    expect(hasFeatureAccess(FEATURES.BUDGETS,       'free')).toBe(false)
    expect(hasFeatureAccess(FEATURES.GOALS,          'free')).toBe(false)
    expect(hasFeatureAccess(FEATURES.EXPORT,         'free')).toBe(false)
    expect(hasFeatureAccess(FEATURES.INSTALLMENTS,   'free')).toBe(false)
    expect(hasFeatureAccess(FEATURES.RECURRING,      'free')).toBe(false)
    expect(hasFeatureAccess(FEATURES.MULTI_WALLETS,  'free')).toBe(false)
  })

  it('admin with free plan still has full access', () => {
    expect(hasFeatureAccess(FEATURES.BUDGETS, 'free', 'elispethke@gmail.com')).toBe(true)
  })

  it('unknown user on free plan is blocked', () => {
    expect(hasFeatureAccess(FEATURES.BUDGETS, 'free', 'stranger@gmail.com')).toBe(false)
  })
})
