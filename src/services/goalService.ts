import { supabase } from './supabase'
import type { Goal, CreateGoalPayload, UpdateGoalPayload } from '@/types/goal'

interface GoalRow {
  id: string
  user_id: string
  name: string
  target_amount: string | number
  current_amount: string | number
  deadline: string
}

function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline,
  }
}

export const goalService = {
  async getAll(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true })

    if (error) throw new Error(error.message)
    return (data as GoalRow[]).map(toGoal)
  },

  async create(payload: CreateGoalPayload): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: payload.userId,
        name: payload.name,
        target_amount: payload.targetAmount,
        current_amount: payload.currentAmount,
        deadline: payload.deadline,
      }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toGoal(data as GoalRow)
  },

  async update(id: string, userId: string, fields: UpdateGoalPayload): Promise<Goal> {
    const updates: Record<string, unknown> = {}
    if (fields.name !== undefined)          updates.name = fields.name
    if (fields.targetAmount !== undefined)  updates.target_amount = fields.targetAmount
    if (fields.currentAmount !== undefined) updates.current_amount = fields.currentAmount
    if (fields.deadline !== undefined)      updates.deadline = fields.deadline

    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toGoal(data as GoalRow)
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  },
}
