import { supabase } from './supabase'
import type { Installment, CreateInstallmentPayload } from '@/types/installment'

interface InstallmentRow {
  id: string
  user_id: string
  total_amount: string | number
  total_installments: number
  description: string
  start_date: string
}

function toInstallment(row: InstallmentRow): Installment {
  return {
    id: row.id,
    userId: row.user_id,
    totalAmount: Number(row.total_amount),
    totalInstallments: row.total_installments,
    description: row.description,
    startDate: row.start_date,
  }
}

export const installmentService = {
  async getAll(userId: string): Promise<Installment[]> {
    const { data, error } = await supabase
      .from('installments')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as InstallmentRow[]).map(toInstallment)
  },

  async create(payload: CreateInstallmentPayload): Promise<Installment> {
    const { data, error } = await supabase
      .from('installments')
      .insert([{
        user_id: payload.userId,
        total_amount: payload.totalAmount,
        total_installments: payload.totalInstallments,
        description: payload.description,
        start_date: payload.startDate,
      }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toInstallment(data as InstallmentRow)
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('installments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  },
}
