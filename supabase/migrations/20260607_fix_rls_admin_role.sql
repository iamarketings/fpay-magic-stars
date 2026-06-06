-- Fix RLS policies to check app_metadata.role instead of JWT top-level role
-- In Supabase Auth JWTs, the top-level 'role' claim is always 'authenticated'
-- The custom admin role is stored in app_metadata

DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "wallets_admin_all" ON wallets;
DROP POLICY IF EXISTS "transactions_admin_select" ON transactions;
DROP POLICY IF EXISTS "system_config_admin_update" ON system_config;
DROP POLICY IF EXISTS "system_config_admin_insert" ON system_config;

CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "wallets_admin_all" ON wallets
  FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "transactions_admin_select" ON transactions
  FOR SELECT TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "system_config_admin_update" ON system_config
  FOR UPDATE TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "system_config_admin_insert" ON system_config
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');
