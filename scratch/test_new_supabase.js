
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pbhfmhfmddcdlcrwqnil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiaGZtaGZtZGRjZGxjcndxbmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDc2NjYsImV4cCI6MjA4Nzc4MzY2Nn0.Qujr9bLNd-QIusuaetMgj8D9fyRuR-HV2R9IJKWiHbw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing connection to NEW Supabase...');
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
