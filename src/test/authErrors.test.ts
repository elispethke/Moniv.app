import { describe, it, expect } from 'vitest'
import { mapAuthError } from '@/features/auth/utils/authErrors'

const t = (key: string) => key  // identity translator — returns the key

describe('mapAuthError', () => {
  it('maps invalid credentials', () => {
    const err = new Error('Invalid login credentials')
    expect(mapAuthError(err, t)).toBe('auth.errors.invalid_credentials')
  })

  it('maps rate limit error', () => {
    const err = new Error('over_email_send_rate_limit')
    expect(mapAuthError(err, t)).toBe('auth.errors.rate_limit')
  })

  it('maps already registered', () => {
    const err = new Error('User already registered')
    expect(mapAuthError(err, t)).toBe('auth.errors.already_registered')
  })

  it('returns unexpected for unknown errors', () => {
    const err = new Error('Something completely unknown happened')
    expect(mapAuthError(err, t)).toBe('auth.errors.unexpected')
  })

  it('handles non-Error objects', () => {
    expect(mapAuthError('Invalid login credentials', t)).toBe('auth.errors.invalid_credentials')
  })
})
