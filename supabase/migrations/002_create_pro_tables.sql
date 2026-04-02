-- ============================================================
-- 002_create_pro_tables.sql
-- Pro plan tables: user_plans, wallets, budgets, goals,
--                  installments, recurring_transactions
-- ============================================================

-- -----------------------------------------------------------
-- user_plans
-- -----------------------------------------------------------
create table if not exists public.user_plans (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  plan     text not null default 'free' check (plan in ('free', 'pro')),
  updated_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;

create policy "Users manage own plan"
  on public.user_plans
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------
-- wallets
-- -----------------------------------------------------------
create table if not exists public.wallets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  balance    numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "Users manage own wallets"
  on public.wallets
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------
-- budgets
-- -----------------------------------------------------------
create table if not exists public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  category     text not null,
  limit_amount numeric(12, 2) not null,
  month        text not null,  -- format: YYYY-MM
  created_at   timestamptz not null default now()
);

alter table public.budgets enable row level security;

create policy "Users manage own budgets"
  on public.budgets
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------
-- goals
-- -----------------------------------------------------------
create table if not exists public.goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  target_amount  numeric(12, 2) not null,
  current_amount numeric(12, 2) not null default 0,
  deadline       date,
  created_at     timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users manage own goals"
  on public.goals
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------
-- installments
-- -----------------------------------------------------------
create table if not exists public.installments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  description        text not null,
  total_amount       numeric(12, 2) not null,
  total_installments integer not null check (total_installments > 0),
  start_date         date not null,
  created_at         timestamptz not null default now()
);

alter table public.installments enable row level security;

create policy "Users manage own installments"
  on public.installments
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------
-- recurring_transactions
-- -----------------------------------------------------------
create table if not exists public.recurring_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount      numeric(12, 2) not null,
  type        text not null check (type in ('income', 'expense')),
  category    text not null,
  frequency   text not null check (frequency in ('monthly', 'weekly')),
  next_date   date not null,
  created_at  timestamptz not null default now()
);

alter table public.recurring_transactions enable row level security;

create policy "Users manage own recurring transactions"
  on public.recurring_transactions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
