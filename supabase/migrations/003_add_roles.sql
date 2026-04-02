-- Add role column to user_plans
ALTER TABLE user_plans
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin', 'user'));

-- Set the owner account as admin
UPDATE user_plans
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'elispethke@gmail.com'
);

-- Index for quick role lookups
CREATE INDEX IF NOT EXISTS user_plans_role_idx ON user_plans (role);
