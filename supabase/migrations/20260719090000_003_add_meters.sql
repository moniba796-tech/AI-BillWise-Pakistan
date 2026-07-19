/*
# Add Smart Meter Support

1. New Tables
- `meters` — a meter registered by a user (their WAPDA/K-Electric meter/consumer ID,
  plus which provider/DISCO it belongs to). Owned by `user_id`.
- `meter_readings` — individual usage readings for a meter (units consumed,
  current load, timestamp, and whether it came from a real provider API or
  was simulated because no provider is configured yet).

2. Security
- RLS enabled on both tables.
- A user can only see/manage meters they registered (`auth.uid() = user_id`).
- A user can only see readings for meters they own (via subquery on `meters`).
- All access requires an authenticated session — no anon access, unlike the
  older demo-mode tables.
*/

CREATE TABLE IF NOT EXISTS meters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    meter_id text NOT NULL,
    label text,
    provider text NOT NULL DEFAULT 'simulated',
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, meter_id)
);

CREATE TABLE IF NOT EXISTS meter_readings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id uuid NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
    units_today decimal(10,2) NOT NULL,
    units_this_month decimal(10,2) NOT NULL,
    current_load_kw decimal(6,2),
    is_simulated boolean NOT NULL DEFAULT true,
    reading_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meter_readings_meter_id_idx ON meter_readings (meter_id, reading_at DESC);

ALTER TABLE meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_meters" ON meters;
CREATE POLICY "users_select_own_meters" ON meters FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_meters" ON meters;
CREATE POLICY "users_insert_own_meters" ON meters FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_meters" ON meters;
CREATE POLICY "users_update_own_meters" ON meters FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_meters" ON meters;
CREATE POLICY "users_delete_own_meters" ON meters FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_select_own_meter_readings" ON meter_readings;
CREATE POLICY "users_select_own_meter_readings" ON meter_readings FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM meters WHERE meters.id = meter_readings.meter_id AND meters.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "users_insert_own_meter_readings" ON meter_readings;
CREATE POLICY "users_insert_own_meter_readings" ON meter_readings FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM meters WHERE meters.id = meter_readings.meter_id AND meters.user_id = auth.uid())
    );
