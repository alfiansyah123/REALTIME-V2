-- SCHEMA SETUP FOR SUPABASE
-- This file creates the tables and functions needed for the dashboard.

-- 1. Create Tables
create table public.conversions (
  id bigserial not null,
  click_id character varying(100) not null,
  sub_id character varying(100) null default 'Unknown'::character varying,
  network character varying(50) null default 'IMONETIZEIT'::character varying,
  country character(2) null default 'US'::bpchar,
  country_name character varying(100) null default 'United States'::character varying,
  traffic_type character varying(5) null default 'WEB'::character varying,
  earning numeric(10, 4) null default 0.0000,
  ip_address character varying(45) null,
  user_agent text null,
  created_at timestamp with time zone not null default now(),
  constraint conversions_pkey primary key (id)
) TABLESPACE pg_default;

create table public.daily_reports (
  id bigserial not null,
  date date not null,
  smartlink character varying(100) not null,
  network character varying(50) null default 'IMONETIZEIT'::character varying,
  visits integer null default 0,
  unique_visits integer null default 0,
  clicks integer null default 0,
  leads integer null default 0,
  payout numeric(10, 4) null default 0.0000,
  epc numeric(10, 4) null default 0.0000,
  cr numeric(5, 2) null default 0.00,
  updated_at timestamp with time zone not null default now(),
  constraint daily_reports_pkey primary key (id),
  constraint daily_reports_date_smartlink_network_key unique (date, smartlink, network)
) TABLESPACE pg_default;

create table public.users (
  id bigserial not null,
  username character varying(50) not null,
  password character varying(255) not null,
  created_at timestamp with time zone not null default now(),
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;

-- 2. Insert Default Admin if not exists
INSERT INTO public.users (username, password)
VALUES ('admin', 'ngelidteam')
ON CONFLICT (username) DO NOTHING;

-- 3. Authentication RPC Functions (For LoginPage.jsx compatibility)

-- Verify Password function
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT)
RETURNS JSON AS $$
DECLARE
    found_user RECORD;
BEGIN
    -- We assume the system uses the 'admin' user or first user for simple password check
    SELECT * INTO found_user FROM public.users LIMIT 1;
    
    IF found_user IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'No users found');
    END IF;

    IF found_user.password = input_password THEN
        RETURN json_build_object('success', true, 'message', 'Login successful');
    ELSE
        RETURN json_build_object('success', false, 'message', 'Invalid password');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Change Password function
CREATE OR REPLACE FUNCTION change_password(old_password TEXT, new_password TEXT)
RETURNS JSON AS $$
DECLARE
    found_user RECORD;
BEGIN
    SELECT * INTO found_user FROM public.users LIMIT 1;
    
    IF found_user IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'No user found');
    END IF;

    IF found_user.password = old_password THEN
        UPDATE public.users SET password = new_password WHERE id = found_user.id;
        RETURN json_build_object('success', true, 'message', 'Password updated successfully');
    ELSE
        RETURN json_build_object('success', false, 'message', 'Old password incorrect');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS and Policies
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Select" ON conversions FOR SELECT USING (true);
CREATE POLICY "Public Insert" ON conversions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Select" ON daily_reports FOR SELECT USING (true);
CREATE POLICY "Public Insert" ON daily_reports FOR INSERT WITH CHECK (true);

-- Users table stays private, accessed only via RPC
CREATE POLICY "No Public Access to Users" ON users FOR ALL USING (false);
