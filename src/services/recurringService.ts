import { supabase } from './supabase'
import type { RecurringTransaction, CreateRecurringPayload } from '@/types/recurring'
import type { TransactionCategory, TransactionType } from '@/types/transaction'

interface RecurringRow {
  id: string
  user_id: string
  amount: string | number
  description: string
  category: TransactionCategory
  type: TransactionType
  frequency: 'monthly' | 'weekly'
  next_date: string
}

function toRecurring(row: RecurringRow): RecurringTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount),
    description: row.description,
    category: row.category,
    type: row.type,
    frequency: row.frequency,
    nextDate: row.next_date,
  }
}

export const recurringService = {
  async getAll(userId: string): Promise<RecurringTransaction[]> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('next_date', { ascending: true })

    if (error) throw new Error(error.message)
    return (data as RecurringRow[]).map(toRecurring)
  },

  async create(payload: CreateRecurringPayload): Promise<RecurringTransaction> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert([{
        user_id: payload.userId,
        amount: payload.amount,
        description: payload.description,
        category: payload.category,
        type: payload.type,
        frequency: payload.frequency,
        next_date: payload.nextDate,
      }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toRecurring(data as RecurringRow)
  },

  async updateNextDate(id: string, userId: string, nextDate: string): Promise<RecurringTransaction> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update({ next_date: nextDate })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toRecurring(data as RecurringRow)
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  },
}
