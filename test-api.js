// Removed require node-fetch

async function testApi() {
    console.log('Testing iMonetizeIt API...');
    const clientId = 232922;
    const apiKey = '0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027';
    
    // 1. Get Token
    const authResp = await fetch('https://api.imonetizeit.com/v1/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ client_id: clientId, api_key: apiKey })
    });
    const authData = await authResp.json();
    const token = authData.access_token;
    
    if (!token) {
        console.log('Failed to get token!');
        return;
    }
    console.log('Token received!');
    
    // 2. Fetch Stats
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = `https://api.imonetizeit.com/v1/statistics/sm?start_date=${today}&end_date=${today}&segments[]=smartlink&timezone=%2B07%3A00&include_archived=1&limit=10`;
    
    console.log('Fetching URL:', baseUrl);
    const statsResp = await fetch(baseUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statsData = await statsResp.json();
    console.log('API Response:', JSON.stringify(statsData.data, null, 2));
}

testApi();
