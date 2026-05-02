-- ============================================
-- SUPABASE MIGRATION SCRIPT
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Enable pgcrypto untuk password verification (bcrypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. TABEL USERS (password-only login)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert admin user dengan password NEWYEAR26
INSERT INTO users (username, password) VALUES 
  ('admin', crypt('NEWYEAR26', gen_salt('bf')))
ON CONFLICT (username) DO UPDATE SET password = crypt('NEWYEAR26', gen_salt('bf'));

-- ============================================
-- 2. TABEL CONVERSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS conversions (
  id BIGSERIAL PRIMARY KEY,
  click_id VARCHAR(100) NOT NULL,
  sub_id VARCHAR(100) DEFAULT 'Unknown',
  network VARCHAR(50) DEFAULT 'IMONETIZEIT',
  country CHAR(2) DEFAULT 'US',
  country_name VARCHAR(100) DEFAULT 'United States',
  traffic_type VARCHAR(5) DEFAULT 'WEB',
  earning DECIMAL(10,4) DEFAULT 0.0000,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. TABEL DAILY_REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS daily_reports (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  smartlink VARCHAR(100) NOT NULL,
  network VARCHAR(50) DEFAULT 'IMONETIZEIT',
  visits INT DEFAULT 0,
  unique_visits INT DEFAULT 0,
  clicks INT DEFAULT 0,
  leads INT DEFAULT 0,
  payout DECIMAL(10,4) DEFAULT 0.0000,
  epc DECIMAL(10,4) DEFAULT 0.0000,
  cr DECIMAL(5,2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, smartlink, network)
);

-- ============================================
-- 4. ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE conversions;

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Anon can read conversions & daily_reports
CREATE POLICY "anon_read_conversions" ON conversions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_daily_reports" ON daily_reports FOR SELECT TO anon USING (true);

-- Anon can insert/update (for postback)
CREATE POLICY "anon_insert_conversions" ON conversions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_daily_reports" ON daily_reports FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_daily_reports" ON daily_reports FOR UPDATE TO anon USING (true);

-- ============================================
-- 6. RPC: PASSWORD VERIFICATION (password-only login)
-- ============================================
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT)
RETURNS JSON AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password INTO stored_hash FROM users WHERE username = 'admin' LIMIT 1;
  
  IF stored_hash IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  IF crypt(input_password, stored_hash) = stored_hash THEN
    RETURN json_build_object('success', true);
  ELSE
    RETURN json_build_object('success', false, 'message', 'Invalid password');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. RPC: CHANGE PASSWORD
-- ============================================
CREATE OR REPLACE FUNCTION change_password(old_password TEXT, new_password TEXT)
RETURNS JSON AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password INTO stored_hash FROM users WHERE username = 'admin' LIMIT 1;
  
  IF stored_hash IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  IF crypt(old_password, stored_hash) != stored_hash THEN
    RETURN json_build_object('success', false, 'message', 'Old password is incorrect');
  END IF;
  
  UPDATE users SET password = crypt(new_password, gen_salt('bf'))
  WHERE username = 'admin';
  
  RETURN json_build_object('success', true, 'message', 'Password changed successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. RPC: COUNTRY LEADS
-- ============================================
CREATE OR REPLACE FUNCTION get_country_leads(target_date DATE)
RETURNS TABLE(country CHAR(2), leads BIGINT) AS $$
  SELECT c.country, COUNT(*) as leads
  FROM conversions c
  WHERE c.created_at::date = target_date
  AND c.country IS NOT NULL AND c.country != ''
  GROUP BY c.country
  ORDER BY leads DESC
  LIMIT 5;
$$ LANGUAGE sql STABLE;


-- ============================================
-- 9. RPC: INCREMENT DAILY REPORT (ATOMIC UPSERT)
-- ============================================
CREATE OR REPLACE FUNCTION increment_daily_report(
    report_date DATE,
    report_smartlink TEXT,
    report_network TEXT,
    report_payout DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_reports (date, smartlink, network, leads, payout, visits, clicks)
    VALUES (report_date, report_smartlink, report_network, 1, report_payout, 0, 0)
    ON CONFLICT (date, smartlink, network)
    DO UPDATE SET 
        leads = daily_reports.leads + 1,
        payout = daily_reports.payout + EXCLUDED.payout;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE! Sekarang jalankan data import jika ada
-- ============================================
