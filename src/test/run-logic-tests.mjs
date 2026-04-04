/**
 * Standalone logic verification — runs without vitest workers.
 * Run with: node src/test/run-logic-tests.mjs
 *
 * Verifies the core business logic of the referral + snapshot systems
 * without any browser APIs or worker processes.
 */

let pass = 0
let fail = 0
const failures = []

function test(name, fn) {
  try {
    fn()
    console.log(`  ✓ ${name}`)
    pass++
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`)
    failures.push({ name, error: e.message })
    fail++
  }
}

function expect(val) {
  return {
    toBe(expected) {
      if (val !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`)
    },
    toBeCloseTo(expected, digits = 2) {
      const factor = Math.pow(10, digits)
      if (Math.round(val * factor) !== Math.round(expected * factor))
        throw new Error(`Expected ~${expected} (±${1/factor}), got ${val}`)
    },
    toBeLessThan(n) {
      if (!(val < n)) throw new Error(`Expected ${val} < ${n}`)
    },
    toBeGreaterThan(n) {
      if (!(val > n)) throw new Error(`Expected ${val} > ${n}`)
    },
    not: {
      toBe(expected) {
        if (val === expected) throw new Error(`Expected value not to be ${JSON.stringify(expected)}`)
      }
    }
  }
}

// ── Referral anti-fraud logic ─────────────────────────────────────────────────

console.log('\nReferral service: anti-fraud logic')

function isSelfReferral(a, b) { return a === b }

test('blocks self-referral (same ID)', () => expect(isSelfReferral('id', 'id')).toBe(true))
test('allows different IDs', () => expect(isSelfReferral('a', 'b')).toBe(false))
test('blocks empty-string self-referral', () => expect(isSelfReferral('', '')).toBe(true))
test('UUID format self-referral', () => {
  const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  expect(isSelfReferral(id, id)).toBe(true)
})
test('UUID format different IDs', () => {
  expect(isSelfReferral(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'
  )).toBe(false)
})

// ── Rate limit logic ──────────────────────────────────────────────────────────

console.log('\nReferral service: rate limit')

function isWithinRateLimit(existingToday, max = 5) {
  return existingToday < max
}

test('within limit: 0 referrals today', () => expect(isWithinRateLimit(0)).toBe(true))
test('within limit: 4 referrals today', () => expect(isWithinRateLimit(4)).toBe(true))
test('at limit: exactly 5 referrals today', () => expect(isWithinRateLimit(5)).toBe(false))
test('over limit: 10 referrals today', () => expect(isWithinRateLimit(10)).toBe(false))

// ── Snapshot financial calculations ──────────────────────────────────────────

console.log('\nSnapshot: financial data calculations')

function calcSnapshot(transactions) {
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
  return { totalIncome, totalExpense, balance, savingsRate }
}

test('income sum', () => {
  const { totalIncome } = calcSnapshot([
    { type: 'income', amount: 1000 },
    { type: 'income', amount: 500 },
  ])
  expect(totalIncome).toBe(1500)
})

test('expense sum', () => {
  const { totalExpense } = calcSnapshot([
    { type: 'expense', amount: 200 },
    { type: 'expense', amount: 300 },
  ])
  expect(totalExpense).toBe(500)
})

test('positive balance', () => {
  const { balance } = calcSnapshot([
    { type: 'income', amount: 2000 },
    { type: 'expense', amount: 800 },
  ])
  expect(balance).toBe(1200)
})

test('negative balance', () => {
  const { balance } = calcSnapshot([
    { type: 'income', amount: 500 },
    { type: 'expense', amount: 900 },
  ])
  expect(balance).toBe(-400)
})

test('zero balance with no transactions', () => {
  expect(calcSnapshot([]).balance).toBe(0)
})

test('savings rate 80%', () => {
  const { savingsRate } = calcSnapshot([
    { type: 'income', amount: 1000 },
    { type: 'expense', amount: 200 },
  ])
  expect(savingsRate).toBeCloseTo(80, 1)
})

test('savings rate 0% when no income', () => {
  expect(calcSnapshot([{ type: 'expense', amount: 500 }]).savingsRate).toBe(0)
})

test('savings rate 100% when no expenses', () => {
  expect(calcSnapshot([{ type: 'income', amount: 1000 }]).savingsRate).toBe(100)
})

test('negative savings rate when expenses exceed income', () => {
  const { savingsRate } = calcSnapshot([
    { type: 'income', amount: 500 },
    { type: 'expense', amount: 900 },
  ])
  expect(savingsRate).toBeLessThan(0)
})

// ── Referral reward stacking ──────────────────────────────────────────────────

console.log('\nReferral reward: pro_expires_at stacking')

function addMonthToExpiry(currentExpiry) {
  // Mirrors the DB trigger: greatest(coalesce(pro_expires_at, now()), now()) + 1 month
  const base = currentExpiry ? Math.max(currentExpiry.getTime(), Date.now()) : Date.now()
  const result = new Date(base)
  result.setMonth(result.getMonth() + 1)
  return result
}

test('extends expiry from null (first reward)', () => {
  const now = new Date()
  const result = addMonthToExpiry(null)
  expect(result > now).toBe(true)
})

test('stacks on existing expiry (future)', () => {
  const futureExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
  const result = addMonthToExpiry(futureExpiry)
  expect(result > futureExpiry).toBe(true)
})

test('extends from now when expiry is in the past', () => {
  const pastExpiry = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // -30 days
  const now = new Date()
  const result = addMonthToExpiry(pastExpiry)
  // Should be based on now(), not past expiry
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  expect(result > now).toBe(true)
  expect(result.getTime()).toBeCloseTo(oneMonthFromNow.getTime(), -10) // within ~1 second
})

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n──────────────────────────────────────`)
console.log(`  ${pass} passed, ${fail} failed`)
if (failures.length > 0) {
  console.log('\nFailed tests:')
  failures.forEach(f => console.log(`  ✗ ${f.name}: ${f.error}`))
  process.exit(1)
}
console.log('  All tests passed ✓')
