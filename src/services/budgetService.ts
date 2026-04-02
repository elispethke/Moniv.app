import { supabase } from './supabase'
import type { Budget, CreateBudgetPayload } from '@/types/budget'

interface BudgetRow {
  id: string
  user_id: string
  category: string
  limit_amount: string | number
  month: string
}

function toBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    limit: Number(row.limit_amount),
    month: row.month,
  }
}

export const budgetService = {
  async getAll(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as BudgetRow[]).map(toBudget)
  },

  async create(payload: CreateBudgetPayload): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        user_id: payload.userId,
        category: payload.category,
        limit_amount: payload.limit,
        month: payload.month,
      }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toBudget(data as BudgetRow)
  },

  async update(id: string, userId: string, fields: Partial<Pick<Budget, 'limit'>>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update({ limit_amount: fields.limit })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toBudget(data as BudgetRow)
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  },
}
