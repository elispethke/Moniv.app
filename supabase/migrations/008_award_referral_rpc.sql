-- ============================================================
-- 008_award_referral_rpc.sql
-- SECURITY DEFINER function to update profiles.pro_expires_at
-- when a referral is completed.
--
-- Required because RLS on profiles only allows users to update
-- their OWN row. The referred user needs to reward the referrer,
-- so we use a SECURITY DEFINER function to bypass RLS safely.
-- ============================================================

CREATE OR REPLACE FUNCTION public.award_referral_pro(p_referrer_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles
  SET pro_expires_at =
    CASE
      WHEN pro_expires_at IS NULL THEN now() + interval '30 days'
      ELSE pro_expires_at + interval '30 days'
    END
  WHERE id = p_referrer_id;
$$;
