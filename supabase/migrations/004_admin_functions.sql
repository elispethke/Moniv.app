-- ── Admin RPC functions (SECURITY DEFINER — bypass RLS, run as superuser) ──
-- These allow the frontend to perform admin operations without an Edge Function.

-- Helper: check if the calling user is an admin
CREATE OR REPLACE FUNCTION is_caller_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_plans
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND email = 'elispethke@gmail.com'
  )
$$;

-- List all users with their plan and role
CREATE OR REPLACE FUNCTION admin_list_users()
RETURNS TABLE(
  id          uuid,
  email       text,
  plan        text,
  role        text,
  created_at  timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_caller_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(up.plan, 'free')::text  AS plan,
    COALESCE(up.role, 'user')::text  AS role,
    u.created_at
  FROM auth.users u
  LEFT JOIN user_plans up ON up.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Set plan for any user (grant or remove Pro)
CREATE OR REPLACE FUNCTION admin_set_plan(target_user_id uuid, new_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_caller_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF new_plan NOT IN ('free', 'pro') THEN
    RAISE EXCEPTION 'Invalid plan: %', new_plan;
  END IF;

  INSERT INTO user_plans (user_id, plan)
  VALUES (target_user_id, new_plan)
  ON CONFLICT (user_id) DO UPDATE SET plan = EXCLUDED.plan;
END;
$$;

-- Set role for any user (admin / user)
CREATE OR REPLACE FUNCTION admin_set_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_caller_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF new_role NOT IN ('admin', 'user') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  INSERT INTO user_plans (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
END;
$$;

-- Grant execute to authenticated users (RLS handled inside the function)
GRANT EXECUTE ON FUNCTION admin_list_users()                      TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_plan(uuid, text)              TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_role(uuid, text)              TO authenticated;
