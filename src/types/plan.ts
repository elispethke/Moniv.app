export type Plan = 'free' | 'pro'
export type Role = 'admin' | 'user'

export interface UserPlan {
  userId: string
  plan: Plan
  role: Role
}

export const PRO_PLAN = {
  name: 'Pro',
  price: 10,
  currency: 'EUR',
  interval: 'year',
} as const
