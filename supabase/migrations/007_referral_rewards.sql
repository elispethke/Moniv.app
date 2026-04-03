-- ============================================================
-- 007_referral_rewards.sql
-- Referral reward: extends Pro by +1 month when a referral
-- transitions to 'completed'.
-- ============================================================

-- Add pro_expires_at to user_plans.
-- NULL = subscription managed by Stripe (no expiry from referrals yet).
-- Non-null = absolute timestamp up to which Pro is active from referrals.
alter table public.user_plans
  add column if not exists pro_expires_at timestamptz;

-- ── Reward function ───────────────────────────────────────────────────────────
-- Called by the trigger below. On any INSERT or status UPDATE to 'completed',
-- it upserts user_plans for the referrer:
--   • plan  = 'pro'
--   • pro_expires_at += 1 month  (stacks; extends the later of now() or current expiry)
create or replace function public.award_referral_reward()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed'
     and (TG_OP = 'INSERT' or old.status is distinct from 'completed')
  then
    insert into public.user_plans (user_id, plan, pro_expires_at, updated_at)
    values (
      new.referrer_id,
      'pro',
      now() + interval '1 month',
      now()
    )
    on conflict (user_id) do update
      set
        plan           = 'pro',
        -- Stack on top of whichever is later: current expiry or now
        pro_expires_at = greatest(
                           coalesce(public.user_plans.pro_expires_at, now()),
                           now()
                         ) + interval '1 month',
        updated_at     = now();
  end if;
  return new;
end;
$$;

-- ── Trigger ───────────────────────────────────────────────────────────────────
drop trigger if exists referral_reward_trigger on public.referrals;

create trigger referral_reward_trigger
  after insert or update of status
  on public.referrals
  for each row
  execute function public.award_referral_reward();
