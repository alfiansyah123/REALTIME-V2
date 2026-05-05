export async function onRequest(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    const API_CREDENTIALS = [
        { clientId: 232922, apiKey: '0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027' },
    ];

    async function getTokens(credentials) {
        const authUrl = 'https://api.imonetizeit.com/v1/auth/session';
        const tokenPromises = credentials.map(async (cred) => {
            try {
                const resp = await fetch(authUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ client_id: cred.clientId, api_key: cred.apiKey }),
                });
                const data = await resp.json();
                return data.access_token || null;
            } catch (e) { return null; }
        });
        const results = await Promise.all(tokenPromises);
        return results.filter(Boolean);
    }

    async function getIMonStats(tokens, start, end) {
        // Ganti timezone jadi UTC+7 (%2B07%3A00) menyesuaikan WIB
        const baseUrl = `https://api.imonetizeit.com/v1/statistics/sm?start_date=${start}&end_date=${end}&segments[]=smartlink&timezone=%2B07%3A00&include_archived=1&limit=1000`;
        const statsPromises = tokens.map(async (token) => {
            try {
                const resp = await fetch(baseUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                const json = await resp.json();
                return json.data || [];
            } catch (e) { return []; }
        });
        const results = await Promise.all(statsPromises);
        const aggregated = {};
        for (const dataArray of results) {
            for (const row of dataArray) {
                const name = row.smartlink || 'Unknown';
                if (!aggregated[name]) {
                    aggregated[name] = {
                        smartlink: name,
                        slug: name,
                        smartlink_id: row.smartlink_id || null,
                        network: row.tracker || 'IMONETIZEIT',
                        visits: 0, unique: 0, clicks: 0, leads: 0, payouts: 0.0
                    };
                }
                aggregated[name].visits += parseInt(row.visits) || 0;
                aggregated[name].unique += parseInt(row.unique || row.unigue || row.uniques) || 0;
                aggregated[name].clicks += parseInt(row.clicks) || 0;
                aggregated[name].leads += parseInt(row.leads) || 0;
                aggregated[name].payouts += parseFloat(row.payouts) || 0.0;
            }
        }
        return aggregated;
    }

    try {
        const tokens = await getTokens(API_CREDENTIALS);
        const imonData = await getIMonStats(tokens, startDate, endDate);
        
        let finalData = Object.values(imonData);

        // Filter out 'Unknown' smartlinks as requested
        const filteredData = finalData.filter(row => row.smartlink && String(row.smartlink).toLowerCase() !== 'unknown');

        filteredData.sort((a, b) => b.payouts - a.payouts);

        return new Response(JSON.stringify({ data: filteredData }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, data: [] }), { status: 500, headers });
    }
}
