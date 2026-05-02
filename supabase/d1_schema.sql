-- D1 Schema for Realtime Dashboard Migration
-- Project: REALTIME - NGELID TEAM
-- D1 ID: 2ce6592b-7a7a-4013-8365-4bd4f68bc824

-- 1. Conversions Table
DROP TABLE IF EXISTS conversions;
CREATE TABLE conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  click_id TEXT NOT NULL,
  sub_id TEXT DEFAULT 'Unknown',
  network TEXT DEFAULT 'IMONETIZEIT',
  country TEXT DEFAULT 'US',
  country_name TEXT DEFAULT 'United States',
  traffic_type TEXT DEFAULT 'WEB',
  earning REAL DEFAULT 0.0,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Daily Reports Table
DROP TABLE IF EXISTS daily_reports;
CREATE TABLE daily_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  smartlink TEXT NOT NULL,
  network TEXT DEFAULT 'IMONETIZEIT',
  visits INTEGER DEFAULT 0,
  unique_visits INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  payout REAL DEFAULT 0.0,
  epc REAL DEFAULT 0.0,
  cr REAL DEFAULT 0.0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, smartlink, network)
);

-- 3. Users Table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Clicks Table (Live Traffic)
DROP TABLE IF EXISTS clicks;
CREATE TABLE clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT,
  country TEXT DEFAULT 'XX',
  ip_address TEXT,
  click_id TEXT,
  os TEXT,
  browser TEXT,
  user_agent TEXT,
  referer TEXT,
  link_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Initial Data
INSERT INTO users (username, password) VALUES ('admin', 'ngelidteam');
