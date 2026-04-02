import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// vi.mock is hoisted — use vi.fn() directly inside the factory, not a variable
vi.mock('@/services/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}))

// Import AFTER mock is declared
import { supabase } from '@/services/supabase'
import { paymentService } from '@/services/paymentService'

// Typed reference to the mocked function
const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>

// ── Mock window.location ───────────────────────────────────────────────────────
const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location')

beforeEach(() => {
  invokeMock.mockReset()
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  if (originalDescriptor) {
    Object.defineProperty(window, 'location', originalDescriptor)
  }
})

// ─────────────────────────────────────────────────────────────────────────────

describe('paymentService.createCheckoutSession', () => {
  it('calls the create-checkout-session edge function', async () => {
    invokeMock.mockResolvedValue({ data: { url: 'https://checkout.stripe.com/pay/test' }, error: null })

    const result = await paymentService.createCheckoutSession()

    expect(invokeMock).toHaveBeenCalledWith('create-checkout-session', { method: 'POST' })
    expect(result.url).toBe('https://checkout.stripe.com/pay/test')
  })

  it('throws when the edge function returns an error', async () => {
    invokeMock.mockResolvedValue({ data: null, error: { message: 'Function invocation failed' } })

    await expect(paymentService.createCheckoutSession()).rejects.toThrow('Function invocation failed')
  })

  it('throws when data has no url', async () => {
    invokeMock.mockResolvedValue({ data: {}, error: null })

    await expect(paymentService.createCheckoutSession()).rejects.toThrow('No checkout URL returned')
  })

  it('throws when data is null', async () => {
    invokeMock.mockResolvedValue({ data: null, error: null })

    await expect(paymentService.createCheckoutSession()).rejects.toThrow('No checkout URL returned')
  })
})

describe('paymentService.upgradeToPro', () => {
  it('redirects the browser to the Stripe checkout URL', async () => {
    const stripeUrl = 'https://checkout.stripe.com/pay/cs_test_abc'
    invokeMock.mockResolvedValue({ data: { url: stripeUrl }, error: null })

    await paymentService.upgradeToPro()

    expect(window.location.href).toBe(stripeUrl)
  })

  it('propagates errors from createCheckoutSession', async () => {
    invokeMock.mockResolvedValue({ data: null, error: { message: 'Stripe unavailable' } })

    await expect(paymentService.upgradeToPro()).rejects.toThrow('Stripe unavailable')
  })
})
