export async function onRequest(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    // 1. Fetch from iMonetizeIt API
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
            } catch (e) {
                return null;
            }
        });
        return (await Promise.all(tokenPromises)).filter(Boolean);
    }

    async function getIMonStats(tokens, start, end) {
        const baseUrl = `https://api.imonetizeit.com/v1/statistics/sm?start_date=${start}&end_date=${end}&segments[]=smartlink&timezone=%2B00%3A00&include_archived=1&limit=1000`;
        const statsPromises = tokens.map(async (token) => {
            try {
                const resp = await fetch(baseUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                const json = await resp.json();
                return json.data || [];
            } catch (e) {
                return [];
            }
        });
        const results = await Promise.all(statsPromises);
        const aggregated = {};
        for (const dataArray of results) {
            for (const row of dataArray) {
                const name = row.smartlink || 'Unknown';
                if (!aggregated[name]) {
                    aggregated[name] = {
                        smartlink: name,
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
        // Fetch iMonetizeIt data
        const tokens = await getTokens(API_CREDENTIALS);
        const imonData = await getIMonStats(tokens, startDate, endDate);

        // 2. Fetch Local D1 Data (Trafee, etc. from Postbacks)
        if (!db) throw new Error('DB connection failed');
        const { results: localData } = await db.prepare(`
            SELECT 
                smartlink,
                network,
                SUM(visits) as visits,
                SUM(unique_visits) as unique_visits,
                SUM(clicks) as clicks,
                SUM(leads) as leads,
                SUM(payout) as payouts
            FROM daily_reports
            WHERE date BETWEEN ? AND ?
            GROUP BY smartlink, network
        `).bind(startDate, endDate).all();

        // 3. Merge Data
        const finalAggregated = imonData; // Start with iMonetizeIt data

        for (const row of localData) {
            const name = row.smartlink;
            const network = row.network || 'UNKNOWN';
            
            // If it's NOT iMonetizeIt (like TRAFEE), or if it doesn't exist in imonData yet, add/merge it
            // We use a combination of name + network to ensure unique rows
            const key = `${name}_${network}`;
            
            if (!finalAggregated[name] || finalAggregated[name].network !== network) {
                // If it's a different network for the same smartlink, we treat it as a new entry for display
                // Or we can just find it. Let's simplify: if it's Trafee, add it.
                if (!finalAggregated[key]) {
                    finalAggregated[key] = {
                        smartlink: name,
                        smartlink_id: null,
                        network: network,
                        visits: row.visits || 0,
                        unique: row.unique_visits || 0,
                        clicks: row.clicks || 0,
                        leads: row.leads || 0,
                        payouts: row.payouts || 0.0
                    };
                }
            } else {
                // If it's the same smartlink and same network, avoid double counting 
                // but since local daily_reports might have extra info, we trust local for payouts if they differ?
                // Actually, let's keep them separate for now as different rows if the network is different.
            }
        }

        const finalData = Object.values(finalAggregated).sort((a, b) => b.payouts - a.payouts);

        return new Response(JSON.stringify({ data: finalData }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}
