-- Ensure the owner account always has Pro + admin role
-- This runs as a safe upsert — no error if user doesn't exist yet
INSERT INTO public.user_plans (user_id, plan, role)
SELECT 
  id,
  'pro',
  'admin'
FROM auth.users
WHERE email = 'elispethke@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  plan = 'pro',
  role = 'admin',
  updated_at = now();
