import { createClient } from '@supabase/supabase-js';

// Traffic Source (Project Generator)
const trafficUrl = import.meta.env.VITE_TRAFFIC_SUPABASE_URL;
const trafficKey = import.meta.env.VITE_TRAFFIC_SUPABASE_ANON_KEY;

// Only create client if credentials exist to avoid errors
// Logic: If traffic credentials are missing, fallback to main project? Or allow null?
// Better to export null or throw error if missing, but let's try to be resilient.

let supabaseTraffic;

if (trafficUrl && trafficKey) {
    supabaseTraffic = createClient(trafficUrl, trafficKey);
} else {
    console.warn('Traffic Supabase credentials missing! Live Traffic may not work.');
    // Fallback to main client if needed? Or just null
    supabaseTraffic = null;
}

export { supabaseTraffic };
