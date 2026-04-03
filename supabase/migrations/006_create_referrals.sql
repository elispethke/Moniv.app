-- ============================================================
-- 006_create_referrals.sql
-- Referral system: table, anti-fraud constraints, RLS policies,
-- and a rate-limit helper function.
-- ============================================================

create table if not exists public.referrals (
  id               uuid        primary key default gen_random_uuid(),
  referrer_id      uuid        not null references auth.users(id) on delete cascade,
  referred_user_id uuid        not null references auth.users(id) on delete cascade,
  status           text        not null default 'pending'
                               check (status in ('pending', 'completed', 'rejected')),
  created_at       timestamptz not null default now(),

  -- Anti-fraud: a user cannot refer themselves
  constraint no_self_referral check (referrer_id != referred_user_id),

  -- Each new user can only be referred once (prevents double-reward abuse)
  constraint unique_referred_user unique (referred_user_id)
);

alter table public.referrals enable row level security;

-- Referrers can read their own outgoing referral records
create policy "Users read own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id);

-- The referred user (newly signed-up) inserts their own referral record
create policy "Referred user inserts referral"
  on public.referrals for insert
  with check (auth.uid() = referred_user_id);

-- Indexes for performance
create index if not exists referrals_referrer_id_idx on public.referrals (referrer_id);
create index if not exists referrals_created_at_idx  on public.referrals (created_at);

-- ── Rate-limit helper ─────────────────────────────────────────────────────────
-- Returns TRUE when the referrer has made fewer than 5 referrals in the past 24 h.
-- Called from the frontend before each insert as a defence-in-depth guard.
create or replace function public.check_referral_rate_limit(p_referrer_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select count(*) < 5
  from public.referrals
  where referrer_id = p_referrer_id
    and created_at > now() - interval '1 day';
$$;
