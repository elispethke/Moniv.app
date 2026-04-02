import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type {
  Transaction,
  TransactionCategory,
  TransactionType,
  TransactionFilters,
} from '@/types/transaction'

// ─── Database row shape (snake_case as returned by PostgreSQL) ───────────────

interface TransactionRow {
  id: string
  user_id: string
  type: TransactionType
  amount: string | number     // NUMERIC may arrive as string from some drivers
  category: TransactionCategory
  description: string | null
  date: string                // YYYY-MM-DD from PostgreSQL DATE column
  created_at: string
  updated_at: string
}

export interface CreateTransactionPayload {
  user_id: string
  type: TransactionType
  amount: number
  category: TransactionCategory
  description: string
  date: string                // YYYY-MM-DD
}

export type UpdateTransactionPayload = Partial<Omit<CreateTransactionPayload, 'user_id'>>

// ─── Row → domain model mapping ──────────────────────────────────────────────

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    amount: Number(row.amount),      // coerce NUMERIC string to JS number
    description: row.description ?? '',
    date: row.date,                  // keep as YYYY-MM-DD — no UTC conversion
    createdAt: row.created_at,
  }
}

// ─── Guard — fails fast and clearly if Supabase is not configured ─────────────

function getClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase não está configurado. Adicione VITE_SUPABASE_URL ao arquivo .env.'
    )
  }
  return supabase
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const transactionSupabaseService = {
  /**
   * Fetches all transactions for a user, with optional client-agnostic filters.
   * RLS enforces user scoping at the database level; user_id is redundant but
   * explicit for defense-in-depth and Supabase plan compatibility.
   */
  async getAll(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<Transaction[]> {
    const client = getClient()

    let query = client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type)
    }
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
    if (filters.dateTo)   query = query.lte('date', filters.dateTo)
    if (filters.search)   query = query.ilike('description', `%${filters.search}%`)

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return (data as TransactionRow[]).map(toTransaction)
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const client = getClient()

    const { data, error } = await client
      .from('transactions')
      .insert([payload])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toTransaction(data as TransactionRow)
  },

  async update(
    id: string,
    userId: string,
    payload: UpdateTransactionPayload
  ): Promise<Transaction> {
    const client = getClient()

    const { data, error } = await client
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toTransaction(data as TransactionRow)
  },

  async remove(id: string, userId: string): Promise<void> {
    const client = getClient()

    const { error } = await client
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  },
}
