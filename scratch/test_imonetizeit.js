
const clientId = 232922;
const apiKey = '0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027';

async function testCredentials() {
    console.log(`Testing credentials for Client ID: ${clientId}...`);
    const url = 'https://api.imonetizeit.com/v1/auth/session';

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ client_id: clientId, api_key: apiKey }),
        });
        const data = await resp.json();
        if (data.access_token) {
            console.log('✅ Authentication SUCCESS. Token acquired.');
            
            // Try fetching stats
            const startDate = new Date().toISOString().split('T')[0];
            const statsUrl = `https://api.imonetizeit.com/v1/statistics/sm?start_date=${startDate}&end_date=${startDate}&segments[]=smartlink&timezone=%2B00%3A00&include_archived=1&limit=100`;
            
            const statsResp = await fetch(statsUrl, {
                headers: { 'Authorization': `Bearer ${data.access_token}` },
            });
            const statsData = await statsResp.json();
            console.log('📊 Stats Data:', JSON.stringify(statsData, null, 2));
        } else {
            console.error('❌ Authentication FAILED:', data);
        }
    } catch (e) {
        console.error('❌ Error during test:', e);
    }
}

testCredentials();
