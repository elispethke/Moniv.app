import { supabase } from './supabase'
import type { Wallet, CreateWalletPayload } from '@/types/wallet'

interface WalletRow {
  id: string
  user_id: string
  name: string
  balance: string | number
}

function toWallet(row: WalletRow): Wallet {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    balance: Number(row.balance),
  }
}

export const walletService = {
  async getAll(userId: string): Promise<Wallet[]> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data as WalletRow[]).map(toWallet)
  },

  async create(payload: CreateWalletPayload): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .insert([{
        user_id: payload.userId,
        name: payload.name,
        balance: payload.balance,
      }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toWallet(data as WalletRow)
  },

  async update(id: string, userId: string, fields: Partial<Pick<Wallet, 'name' | 'balance'>>): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .update(fields)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toWallet(data as WalletRow)
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  },
}
