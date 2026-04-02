import type { TransactionCategory, TransactionType } from './transaction'

export type RecurringFrequency = 'monthly' | 'weekly'

export interface RecurringTransaction {
  id: string
  userId: string
  amount: number
  description: string
  category: TransactionCategory
  type: TransactionType
  frequency: RecurringFrequency
  nextDate: string  // YYYY-MM-DD
}

export type CreateRecurringPayload = Omit<RecurringTransaction, 'id'>
