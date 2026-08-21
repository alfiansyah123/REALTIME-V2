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
        { clientId: 232922, apiKey: '0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027', network: 'IMONETIZEIT' },
        { clientId: 253423, apiKey: 'fb6a76da0d2f0ae9db4abd239699a5e14520ead232f25e6f4ed936a5da9b8b29', network: 'IMONETIZEIT2' },
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
                return data.access_token ? { token: data.access_token, network: cred.network } : null;
            } catch (e) { return null; }
        });
        const results = await Promise.all(tokenPromises);
        return results.filter(Boolean);
    }

    async function getIMonStats(tokenObjs, start, end) {
        const baseUrl = `https://api.imonetizeit.com/v1/statistics/sm?start_date=${start}&end_date=${end}&segments[]=smartlink&timezone=%2B00%3A00&include_archived=1&limit=1000`;
        const statsPromises = tokenObjs.map(async ({ token, network }) => {
            try {
                const resp = await fetch(baseUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                const json = await resp.json();
                return (json.data || []).map(row => ({ ...row, _accountNetwork: network }));
            } catch (e) { return []; }
        });
        const results = await Promise.all(statsPromises);
        const aggregated = {};
        for (const dataArray of results) {
            for (const row of dataArray) {
                // Key by smartlink name + account network to keep accounts separate
                const key = `${row.smartlink || 'Unknown'}__${row._accountNetwork || 'IMONETIZEIT'}`;
                if (!aggregated[key]) {
                    aggregated[key] = {
                        smartlink: row.smartlink || 'Unknown',
                        slug: row.smartlink || 'Unknown',
                        smartlink_id: row.smartlink_id || null,
                        network: row._accountNetwork || 'IMONETIZEIT',
                        visits: 0, unique: 0, clicks: 0, leads: 0, payouts: 0.0
                    };
                }
                aggregated[key].visits += parseInt(row.visits) || 0;
                aggregated[key].unique += parseInt(row.unique || row.unigue || row.uniques) || 0;
                aggregated[key].clicks += parseInt(row.clicks) || 0;
                aggregated[key].leads += parseInt(row.leads) || 0;
                aggregated[key].payouts += parseFloat(row.payouts) || 0.0;
            }
        }
        return aggregated;
    }

    try {
        const tokens = await getTokens(API_CREDENTIALS);
        const imonData = await getIMonStats(tokens, startDate, endDate);
        
        let finalData = Object.values(imonData);
        
        // Trafee (D1) integration
        try {
            const { results: d1Stats } = await db.prepare(`
                SELECT 
                    t.username as smartlink,
                    c.slug,
                    'TRAFEE' as network,
                    COUNT(c.id) as clicks,
                    SUM(CASE WHEN c.is_lead = 1 THEN 1 ELSE 0 END) as leads,
                    SUM(COALESCE(c.payout, 0)) as payouts
                FROM clicks c
                LEFT JOIN team t ON c.slug = t.username
                WHERE DATE(c.created_at) BETWEEN ? AND ?
                GROUP BY c.slug
            `).bind(startDate, endDate).all();

            if (d1Stats && d1Stats.length > 0) {
                d1Stats.forEach(row => {
                    finalData.push({
                        ...row,
                        visits: row.clicks,
                        unique: row.clicks,
                        smartlink: row.smartlink || row.slug
                    });
                });
            }
        } catch (e) { console.error('D1 Fetch Error:', e); }

        finalData.sort((a, b) => b.payouts - a.payouts);

        return new Response(JSON.stringify({ data: finalData }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, data: [] }), { status: 500, headers });
    }
}
