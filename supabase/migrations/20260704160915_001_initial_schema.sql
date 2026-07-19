/*
# AI BillWise Pakistan - Initial Schema

1. New Tables
- `bills` - Store electricity bills with unit consumption and costs
- `appliances` - Store user appliance usage for calculations
- `wapda_offices` - Store WAPDA office locations with contact info

2. Security
- Enable RLS on all tables
- Allow anon + authenticated CRUD (single-tenant demo app)
*/

-- Bills table to store electricity bill history
CREATE TABLE IF NOT EXISTS bills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_name text NOT NULL,
    consumer_id text,
    address text,
    month text NOT NULL,
    year int NOT NULL,
    units_consumed decimal(10,2) NOT NULL,
    previous_units decimal(10,2),
    current_units decimal(10,2),
    amount decimal(12,2) NOT NULL,
    taxes decimal(12,2),
    fuel_adjustment decimal(12,2),
    total_amount decimal(12,2) NOT NULL,
    due_date date,
    payment_status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- Appliance usage table for calculator
CREATE TABLE IF NOT EXISTS appliances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    wattage int NOT NULL,
    hours_daily decimal(4,1) NOT NULL DEFAULT 0,
    quantity int NOT NULL DEFAULT 1,
    days_used int NOT NULL DEFAULT 30,
    estimated_units decimal(10,2) DEFAULT 0,
    estimated_cost decimal(12,2) DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- WAPDA offices for location finder
CREATE TABLE IF NOT EXISTS wapda_offices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    city text NOT NULL,
    address text NOT NULL,
    phone text,
    website text,
    latitude decimal(10,8),
    longitude decimal(11,8),
    opening_time text DEFAULT '09:00',
    closing_time text DEFAULT '17:00',
    created_at timestamptz DEFAULT now()
);

-- Solar calculations history
CREATE TABLE IF NOT EXISTS solar_calculations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    monthly_bill decimal(12,2) NOT NULL,
    roof_size int,
    city text,
    recommended_system_kw decimal(6,2),
    estimated_cost decimal(14,2),
    monthly_savings decimal(12,2),
    payback_years decimal(5,1),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE wapda_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_calculations ENABLE ROW LEVEL SECURITY;

-- Policies for bills (anon + authenticated for demo)
DROP POLICY IF EXISTS "anon_select_bills" ON bills;
CREATE POLICY "anon_select_bills" ON bills FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bills" ON bills;
CREATE POLICY "anon_insert_bills" ON bills FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bills" ON bills;
CREATE POLICY "anon_update_bills" ON bills FOR UPDATE
    TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bills" ON bills;
CREATE POLICY "anon_delete_bills" ON bills FOR DELETE
    TO anon, authenticated USING (true);

-- Policies for appliances
DROP POLICY IF EXISTS "anon_select_appliances" ON appliances;
CREATE POLICY "anon_select_appliances" ON appliances FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_appliances" ON appliances;
CREATE POLICY "anon_insert_appliances" ON appliances FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_appliances" ON appliances;
CREATE POLICY "anon_update_appliances" ON appliances FOR UPDATE
    TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_appliances" ON appliances;
CREATE POLICY "anon_delete_appliances" ON appliances FOR DELETE
    TO anon, authenticated USING (true);

-- Policies for wapda_offices (read-only for public)
DROP POLICY IF EXISTS "anon_select_wapda" ON wapda_offices;
CREATE POLICY "anon_select_wapda" ON wapda_offices FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_wapda" ON wapda_offices;
CREATE POLICY "anon_insert_wapda" ON wapda_offices FOR INSERT
    TO anon, authenticated WITH CHECK (true);

-- Policies for solar_calculations
DROP POLICY IF EXISTS "anon_select_solar" ON solar_calculations;
CREATE POLICY "anon_select_solar" ON solar_calculations FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_solar" ON solar_calculations;
CREATE POLICY "anon_insert_solar" ON solar_calculations FOR INSERT
    TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_solar" ON solar_calculations;
CREATE POLICY "anon_delete_solar" ON solar_calculations FOR DELETE
    TO anon, authenticated USING (true);

-- Insert sample WAPDA offices
INSERT INTO wapda_offices (name, city, address, phone, website, latitude, longitude) VALUES
('WAPDA House Lahore', 'Lahore', '70-A, Egerton Road, Lahore', '042-99201111', 'https://lesco.gov.pk', 31.5497, 74.3436),
('MEPCO Headquarters', 'Multan', 'Khanewal Road, Multan', '061-9210011', 'https://mepco.com.pk', 30.1575, 71.5249),
('FESCO Headquarters', 'Faisalabad', 'Jaranwala Road, Faisalabad', '041-8711222', 'https://fesco.com.pk', 31.4504, 73.1350),
('IESCO Headquarters', 'Islamabad', 'G-8 Markaz, Islamabad', '051-9250222', 'https://iesco.com.pk', 33.6844, 73.0479),
('PESCO Headquarters', 'Peshawar', 'University Road, Peshawar', '091-9211714', 'https://pesco.com.pk', 34.0151, 71.5249),
('QESCO Headquarters', 'Quetta', 'Airport Road, Quetta', '081-9205111', 'https://qesco.com.pk', 30.1798, 67.0014),
('HESCO Headquarters', 'Hyderabad', 'Hyderabad Bypass, Hyderabad', '022-9206000', 'https://hesco.gov.pk', 25.3960, 68.3726),
('K-Electric Headquarters', 'Karachi', 'Garden Road, Karachi', '021-9228500', 'https://ke.com.pk', 24.8607, 67.0014)
ON CONFLICT DO NOTHING;
