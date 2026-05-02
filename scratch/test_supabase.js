
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hoxtglyqihxwphhcfijz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveHRnbHlxaWh4d3BoaGNmaWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjA2ODYsImV4cCI6MjA4ODEzNjY4Nn0.bdVmgjExKX11Bq6SEWRWGI9OCP5EvQSRawQ0-0eWTDI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    try {
        const { data, error } = await supabase.rpc('verify_password', {
            input_password: 'test'
        });

        if (error) {
            console.error('RPC Error:', error);
        } else {
            console.log('RPC Success:', data);
        }
    } catch (err) {
        console.error('Network/Other Error:', err);
    }
}

testConnection();
