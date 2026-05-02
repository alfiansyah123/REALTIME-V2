export async function onRequest(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    
    // Try to get from body (POST) or searchParams (GET)
    let startDate, endDate, smartlinkId;
    try {
        const body = await context.request.json();
        startDate = body.startDate;
        endDate = body.endDate;
        smartlinkId = body.smartlinkId;
    } catch {
        startDate = url.searchParams.get('startDate');
        endDate = url.searchParams.get('endDate');
        smartlinkId = url.searchParams.get('smartlinkId');
    }

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!startDate) startDate = new Date().toISOString().split('T')[0];
    if (!endDate) endDate = new Date().toISOString().split('T')[0];

    // iMonetizeIt API Credentials (from Supabase original code)
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
                console.error('Token fetch error:', e);
                return null;
            }
        });
        return (await Promise.all(tokenPromises)).filter(Boolean);
    }

    async function getCountryStats(tokens, start, end, smId) {
        let statsUrl = `https://api.imonetizeit.com/v1/statistics/sm`
            + `?start_date=${start}`
            + `&end_date=${end}`
            + `&segments[]=country`
            + `&timezone=%2B00%3A00`
            + `&include_archived=1`
            + `&limit=1000`;

        if (smId) {
            statsUrl += `&sm_id[]=${encodeURIComponent(smId)}`;
        }

        const statsPromises = tokens.map(async (token) => {
            try {
                const resp = await fetch(statsUrl, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const json = await resp.json();
                return json.data || [];
            } catch (e) {
                console.error('Stats fetch error:', e);
                return [];
            }
        });

        const results = await Promise.all(statsPromises);
        const countryStats = {};

        for (const dataArray of results) {
            for (const row of dataArray) {
                const countryCode = row.country || 'XX';
                if (!countryStats[countryCode]) {
                    countryStats[countryCode] = {
                        country: countryCode,
                        visits: 0, unique: 0, clicks: 0,
                        leads: 0, payouts: 0.0
                    };
                }
                countryStats[countryCode].visits += parseInt(row.visits) || 0;
                countryStats[countryCode].unique += parseInt(row.unique || row.unigue || row.uniques) || 0;
                countryStats[countryCode].clicks += parseInt(row.clicks) || 0;
                countryStats[countryCode].leads += parseInt(row.leads) || 0;
                countryStats[countryCode].payouts += parseFloat(row.payouts) || 0.0;
            }
        }

        return Object.values(countryStats).sort((a, b) => b.payouts - a.payouts || b.clicks - a.clicks);
    }

    try {
        const tokens = await getTokens(API_CREDENTIALS);
        if (tokens.length === 0) throw new Error('Failed to authenticate with iMonetizeIt');

        const data = await getCountryStats(tokens, startDate, endDate, smartlinkId);

        return new Response(JSON.stringify({ data }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}
