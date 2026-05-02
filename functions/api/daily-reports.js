export async function onRequest(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!db) return new Response(JSON.stringify({ error: 'DB connection failed' }), { status: 500, headers });

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
            } catch (e) { return null; }
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
        // Parallel fetching for performance
        const tokensPromise = getTokens(API_CREDENTIALS);
        
        // 2. Fetch Click Stats from D1 'clicks' table (Realtime Traffic)
        // Group by slug/smartlink
        const localClicksPromise = db.prepare(`
            SELECT slug, COUNT(*) as total_clicks, COUNT(DISTINCT ip_address) as unique_clicks
            FROM clicks
            WHERE created_at BETWEEN ? AND ?
            GROUP BY slug
        `).bind(startDate + 'T00:00:00Z', endDate + 'T23:59:59Z').all();

        // 3. Fetch Lead Stats from D1 'daily_reports' (Postbacks)
        const localLeadsPromise = db.prepare(`
            SELECT smartlink, network, SUM(leads) as leads, SUM(payout) as payouts
            FROM daily_reports
            WHERE date BETWEEN ? AND ?
            GROUP BY smartlink, network
        `).bind(startDate, endDate).all();

        const [tokens, localClicksResult, localLeadsResult] = await Promise.all([
            tokensPromise, localClicksPromise, localLeadsPromise
        ]);

        const imonData = tokens.length > 0 ? await getIMonStats(tokens, startDate, endDate) : {};
        const localClicks = localClicksResult.results || [];
        const localLeads = localLeadsResult.results || [];

        // Final Aggregation Map
        const finalMap = imonData;

        // Process Local Leads (Trafee, etc.)
        for (const row of localLeads) {
            const name = row.smartlink;
            const network = row.network || 'UNKNOWN';
            
            if (network !== 'IMONETIZEIT' || !finalMap[name]) {
                const key = network === 'IMONETIZEIT' ? name : `${name}_${network}`;
                if (!finalMap[key]) {
                    finalMap[key] = {
                        smartlink: name,
                        smartlink_id: null,
                        network: network,
                        visits: 0, unique: 0, clicks: 0, leads: 0, payouts: 0.0
                    };
                }
                finalMap[key].leads += row.leads || 0;
                finalMap[key].payouts += row.payouts || 0.0;
            }
        }

        // Process Local Clicks (Realtime Traffic Attribution)
        for (const row of localClicks) {
            const name = row.slug;
            // Add these clicks to any entry with this smartlink name that doesn't have click data yet
            // Or if it's a Trafee entry, we definitely want to show the clicks we tracked.
            for (const key in finalMap) {
                if (finalMap[key].smartlink === name) {
                    // Only add if it's not iMonetizeIt (because iMonetizeIt has its own click data)
                    // Or if iMonetizeIt data is 0 for some reason.
                    if (finalMap[key].network !== 'IMONETIZEIT' || finalMap[key].clicks === 0) {
                        finalMap[key].clicks = row.total_clicks;
                        finalMap[key].unique = row.unique_clicks;
                        finalMap[key].visits = row.total_clicks; // Proxy visits with clicks
                    }
                }
            }
            
            // If the slug doesn't exist in the map at all (clicks with 0 leads), add it as UNKNOWN network
            const slugExists = Object.values(finalMap).some(item => item.smartlink === name);
            if (!slugExists) {
                finalMap[name] = {
                    smartlink: name,
                    smartlink_id: null,
                    network: 'TRAFFIC',
                    visits: row.total_clicks,
                    unique: row.unique_clicks,
                    clicks: row.total_clicks,
                    leads: 0,
                    payouts: 0.0
                };
            }
        }

        const finalData = Object.values(finalMap).sort((a, b) => b.payouts - a.payouts || b.clicks - a.clicks);

        return new Response(JSON.stringify({ data: finalData }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}
