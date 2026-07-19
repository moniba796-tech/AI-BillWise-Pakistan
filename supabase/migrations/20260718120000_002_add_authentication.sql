/*
# Add Authentication Support

1. Changes
- Add `user_id` column to `bills`, `appliances`, and `solar_calculations`
  (defaults to the logged-in user's id, so existing insert code doesn't
  need to change)
- `wapda_offices` stays public reference data (no owner)

2. Security
- Drop old anon-open policies
- Add per-user policies: authenticated users can only see/edit their own rows
- `wapda_offices` remains readable by anon + authenticated (public directory)
*/

-- ── bills ────────────────────────────────────────────────────────────
ALTER TABLE bills ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "anon_select_bills" ON bills;
DROP POLICY IF EXISTS "anon_insert_bills" ON bills;
DROP POLICY IF EXISTS "anon_update_bills" ON bills;
DROP POLICY IF EXISTS "anon_delete_bills" ON bills;

CREATE POLICY "users_select_own_bills" ON bills FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_bills" ON bills FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_bills" ON bills FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_bills" ON bills FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- ── appliances ───────────────────────────────────────────────────────
ALTER TABLE appliances ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "anon_select_appliances" ON appliances;
DROP POLICY IF EXISTS "anon_insert_appliances" ON appliances;
DROP POLICY IF EXISTS "anon_update_appliances" ON appliances;
DROP POLICY IF EXISTS "anon_delete_appliances" ON appliances;

CREATE POLICY "users_select_own_appliances" ON appliances FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_appliances" ON appliances FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_appliances" ON appliances FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_appliances" ON appliances FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- ── solar_calculations ───────────────────────────────────────────────
ALTER TABLE solar_calculations ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "anon_select_solar" ON solar_calculations;
DROP POLICY IF EXISTS "anon_insert_solar" ON solar_calculations;
DROP POLICY IF EXISTS "anon_delete_solar" ON solar_calculations;

CREATE POLICY "users_select_own_solar_calculations" ON solar_calculations FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_solar_calculations" ON solar_calculations FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── wapda_offices stays public (no user_id, no policy change) ─────────
