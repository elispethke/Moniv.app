-- =============================================================================
-- Finora — Migration 001: transactions table
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------

-- Required for uuid_generate_v4().
-- Already enabled in most Supabase projects; safe to run again.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ---------------------------------------------------------------------------
-- 1. Table definition
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.transactions (

  -- Primary key
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Owner — every row is scoped to a single authenticated user
  user_id       UUID          NOT NULL
                              REFERENCES auth.users (id)
                              ON DELETE CASCADE,

  -- Domain fields (mirror of src/types/transaction.ts)
  type          TEXT          NOT NULL
                              CHECK (type IN ('income', 'expense')),

  amount        NUMERIC(15, 2) NOT NULL
                              CHECK (amount > 0),

  category      TEXT          NOT NULL
                              CHECK (category IN (
                                -- income categories
                                'salary',
                                'freelance',
                                'investment',
                                'other-income',
                                -- expense categories
                                'food',
                                'transport',
                                'housing',
                                'health',
                                'education',
                                'entertainment',
                                'shopping',
                                'utilities',
                                'other-expense'
                              )),

  description   TEXT,         -- optional free-text note

  -- Transaction date chosen by the user (not the insert timestamp)
  date          DATE          NOT NULL DEFAULT CURRENT_DATE,

  -- Audit timestamps (managed by the database)
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE  public.transactions                IS 'Personal finance transactions owned by individual users.';
COMMENT ON COLUMN public.transactions.user_id        IS 'References auth.users — enforced by RLS.';
COMMENT ON COLUMN public.transactions.type           IS '"income" or "expense".';
COMMENT ON COLUMN public.transactions.amount         IS 'Positive monetary value; currency determined by user profile.';
COMMENT ON COLUMN public.transactions.category       IS 'Matches the TransactionCategory union in the frontend.';
COMMENT ON COLUMN public.transactions.date           IS 'Date the transaction occurred (user-supplied), not the insert time.';


-- ---------------------------------------------------------------------------
-- 2. Automatic updated_at trigger
-- ---------------------------------------------------------------------------

-- Reusable function — shared across tables that need updated_at maintenance
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- ---------------------------------------------------------------------------
-- 3. Performance indexes
-- ---------------------------------------------------------------------------

-- Most queries filter and sort by user + date
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON public.transactions (user_id, date DESC);

-- Aggregations by type (income/expense totals)
CREATE INDEX IF NOT EXISTS idx_transactions_user_type
  ON public.transactions (user_id, type);

-- Category breakdowns
CREATE INDEX IF NOT EXISTS idx_transactions_user_category
  ON public.transactions (user_id, category);

-- Feed / recent-transactions list
CREATE INDEX IF NOT EXISTS idx_transactions_user_created
  ON public.transactions (user_id, created_at DESC);


-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------

-- Enable RLS — no row is accessible without a matching policy
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (idempotent re-runs)
DROP POLICY IF EXISTS "transactions: users can read own rows"   ON public.transactions;
DROP POLICY IF EXISTS "transactions: users can insert own rows" ON public.transactions;
DROP POLICY IF EXISTS "transactions: users can update own rows" ON public.transactions;
DROP POLICY IF EXISTS "transactions: users can delete own rows" ON public.transactions;


-- SELECT — a user may only see their own transactions
CREATE POLICY "transactions: users can read own rows"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- INSERT — user_id must equal the caller's UID; prevents spoofing
CREATE POLICY "transactions: users can insert own rows"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- UPDATE — row must belong to the caller; cannot change user_id to another user
CREATE POLICY "transactions: users can update own rows"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING     (auth.uid() = user_id)   -- which rows can be targeted
  WITH CHECK (auth.uid() = user_id);  -- what the row may look like after update


-- DELETE — a user may only delete their own transactions
CREATE POLICY "transactions: users can delete own rows"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 5. Verification queries (safe to run after migration)
-- ---------------------------------------------------------------------------

-- Confirm table exists with expected columns
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'transactions'
-- ORDER BY ordinal_position;

-- Confirm RLS is enabled
-- SELECT relname, relrowsecurity
-- FROM pg_class
-- WHERE relname = 'transactions';

-- Confirm policies
-- SELECT policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'transactions';
