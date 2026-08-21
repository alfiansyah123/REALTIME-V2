export async function onRequest(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }

    if (context.request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const API_CREDENTIALS = [
        { clientId: 232922, apiKey: '0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027', network: 'IMONETIZEIT' },
        { clientId: 253423, apiKey: 'fb6a76da0d2f0ae9db4abd239699a5e14520ead232f25e6f4ed936a5da9b8b29', network: 'IMONETIZEIT2' },
    ]

    async function getTokens(credentials) {
        const url = 'https://api.imonetizeit.com/v1/auth/session'
        const tokenPromises = credentials.map(async (cred) => {
            try {
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ client_id: cred.clientId, api_key: cred.apiKey }),
                })
                const data = await resp.json()
                return data.access_token ? { token: data.access_token, network: cred.network } : null
            } catch (e) {
                console.error('Token fetch error:', e)
                return null
            }
        })
        return (await Promise.all(tokenPromises)).filter(Boolean)
    }

    async function getCountryStats(tokenObjs, startDate, endDate, smartlinkId) {
        let baseUrl = `https://api.imonetizeit.com/v1/statistics/sm`
            + `?start_date=${startDate}`
            + `&end_date=${endDate}`
            + `&segments[]=country`
            + `&timezone=%2B00%3A00`
            + `&include_archived=1`
            + `&limit=1000`

        if (smartlinkId) {
            baseUrl += `&sm_id[]=${encodeURIComponent(smartlinkId)}`
        }

        const statsPromises = tokenObjs.map(async ({ token }) => {
            try {
                const resp = await fetch(baseUrl, {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                const json = await resp.json()
                return json.data || []
            } catch (e) {
                console.error('Stats fetch error:', e)
                return []
            }
        })

        const results = await Promise.all(statsPromises)
        const countryStats = {}

        for (const dataArray of results) {
            for (const row of dataArray) {
                const countryCode = row.country || 'XX'

                if (!countryStats[countryCode]) {
                    countryStats[countryCode] = {
                        country: countryCode,
                        visits: 0, unique: 0, clicks: 0,
                        leads: 0, payouts: 0.0
                    }
                }

                countryStats[countryCode].visits += parseInt(row.visits) || 0
                countryStats[countryCode].unique += parseInt(row.unique || row.unigue || row.uniques) || 0
                countryStats[countryCode].clicks += parseInt(row.clicks) || 0
                countryStats[countryCode].leads += parseInt(row.leads) || 0
                countryStats[countryCode].payouts += parseFloat(row.payouts) || 0.0
            }
        }

        return Object.values(countryStats).sort((a, b) => {
            if (b.payouts !== a.payouts) return b.payouts - a.payouts
            return b.clicks - a.clicks
        })
    }

    try {
        let startDate, endDate, smartlinkId, network
        const db = context.env.DB;

        if (context.request.method === 'POST') {
            const body = await context.request.json()
            startDate = body.startDate
            endDate = body.endDate
            smartlinkId = body.smartlinkId
            network = body.network || 'IMONETIZEIT'
        } else {
            const url = new URL(context.request.url)
            startDate = url.searchParams.get('startDate')
            endDate = url.searchParams.get('endDate')
            smartlinkId = url.searchParams.get('smartlinkId')
            network = url.searchParams.get('network') || 'IMONETIZEIT'
        }

        if (!startDate) startDate = new Date().toISOString().split('T')[0]
        if (!endDate) endDate = new Date().toISOString().split('T')[0]

        // --- TRAFEE D1 DATABASE LOGIC ---
        if (String(network).toUpperCase() === 'TRAFEE') {
            if (!db) {
                return new Response(JSON.stringify({ error: 'DB not connected', data: [] }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 1. Clicks dari D1 clicks table
            const { results: clickStats } = await db.prepare(`
                SELECT 
                    country,
                    COUNT(id) as clicks,
                    COUNT(DISTINCT ip_address) as unique_clicks
                FROM clicks
                WHERE user_id = ?
                  AND DATE(created_at) BETWEEN ? AND ?
                  AND LOWER(COALESCE(network, '')) != 'imonetizeit'
                GROUP BY country
            `).bind(smartlinkId, startDate, endDate).all();

            // 2. Leads dari D1 conversions table
            const { results: leadStats } = await db.prepare(`
                SELECT 
                    country,
                    COUNT(id) as leads,
                    SUM(earning) as payouts
                FROM conversions
                WHERE sub_id = ?
                  AND DATE(created_at) BETWEEN ? AND ?
                  AND network = 'TRAFEE'
                GROUP BY country
            `).bind(smartlinkId, startDate, endDate).all();

            // 3. Gabungkan Klik & Leads per negara
            const countryMap = {};

            for (const row of (clickStats || [])) {
                let countryCode = (row.country || 'XX').toUpperCase();
                if (countryCode === 'UK') countryCode = 'GB';
                
                if (countryMap[countryCode]) {
                    countryMap[countryCode].visits += row.clicks;
                    countryMap[countryCode].unique += row.unique_clicks;
                    countryMap[countryCode].clicks += row.clicks;
                } else {
                    countryMap[countryCode] = {
                        country: countryCode,
                        visits: row.clicks,
                        unique: row.unique_clicks,
                        clicks: row.clicks,
                        leads: 0,
                        payouts: 0.0
                    };
                }
            }

            for (const row of (leadStats || [])) {
                let countryCode = (row.country || 'XX').toUpperCase();
                if (countryCode === 'UK') countryCode = 'GB';
                
                if (countryMap[countryCode]) {
                    countryMap[countryCode].leads += row.leads || 0;
                    countryMap[countryCode].payouts += row.payouts || 0.0;
                } else {
                    countryMap[countryCode] = {
                        country: countryCode,
                        visits: 0,
                        unique: 0,
                        clicks: 0,
                        leads: row.leads || 0,
                        payouts: row.payouts || 0.0
                    };
                }
            }

            const data = Object.values(countryMap).sort((a, b) => b.payouts - a.payouts || b.clicks - a.clicks);

            return new Response(JSON.stringify({ data }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // --- IMONETIZEIT API LOGIC ---
        let tokens = await getTokens(API_CREDENTIALS)
        if (network && network.toUpperCase() !== 'TRAFEE') {
            tokens = tokens.filter(t => t.network === network);
        }
        if (tokens.length === 0) throw new Error('Failed to authenticate with iMonetizeIt or network not found')

        const data = await getCountryStats(tokens, startDate, endDate, smartlinkId)

        return new Response(JSON.stringify({ data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
}
