export async function onRequest(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    if (!db) return new Response(JSON.stringify({ error: 'DB not connected', data: [] }), { status: 500, headers });

    try {
        // 1. Klik dari tabel clicks, JOIN ke team buat dapet nama asli member
        // HANYA ambil clicks yang network-nya TRAFEE (bukan semua clicks)
        const { results: clickStats } = await db.prepare(`
            SELECT 
                COALESCE(t.name, c.user_id) as smartlink,
                c.user_id,
                'TRAFEE' as network,
                COUNT(c.id) as clicks,
                COUNT(DISTINCT c.ip_address) as unique_clicks
            FROM clicks c
            LEFT JOIN team t ON c.user_id = t.user_id
            WHERE DATE(c.created_at) BETWEEN ? AND ?
              AND (c.network = 'TRAFEE' OR c.network = 'NETWORK' OR c.s3 = 'TRAFEE')
            GROUP BY c.user_id
            ORDER BY clicks DESC
        `).bind(startDate, endDate).all();

        // 2. Leads dari tabel daily_reports (postback Trafee)
        const { results: leadStats } = await db.prepare(`
            SELECT 
                COALESCE(t.name, dr.smartlink) as smartlink,
                dr.smartlink as user_id,
                dr.network, 
                SUM(dr.leads) as leads, 
                SUM(dr.payout) as payouts
            FROM daily_reports dr
            LEFT JOIN team t ON dr.smartlink = t.user_id
            WHERE dr.date BETWEEN ? AND ? AND dr.network = 'TRAFEE'
            GROUP BY dr.smartlink
        `).bind(startDate, endDate).all();

        // 3. Gabungin Klik + Leads
        const dataMap = {};

        for (const row of (clickStats || [])) {
            const key = row.user_id;
            dataMap[key] = {
                smartlink: row.smartlink,
                user_id: row.user_id,
                network: 'TRAFEE',
                visits: row.clicks,
                unique: row.unique_clicks,
                clicks: row.clicks,
                leads: 0,
                payouts: 0.0
            };
        }

        for (const row of (leadStats || [])) {
            const key = row.user_id;
            if (dataMap[key]) {
                dataMap[key].leads += row.leads || 0;
                dataMap[key].payouts += row.payouts || 0.0;
                // Pastikan smartlink pake nama tim kalo ada
                dataMap[key].smartlink = row.smartlink;
            } else {
                dataMap[key] = {
                    smartlink: row.smartlink,
                    user_id: row.user_id,
                    network: (row.network || 'TRAFEE').toUpperCase(),
                    visits: 0, unique: 0, clicks: 0,
                    leads: row.leads || 0,
                    payouts: row.payouts || 0.0
                };
            }
        }

        const data = Object.values(dataMap)
            .filter(row => row.smartlink && String(row.smartlink).toLowerCase() !== 'unknown')
            .sort((a, b) => b.payouts - a.payouts || b.clicks - a.clicks);

        return new Response(JSON.stringify({ data }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, data: [] }), { status: 500, headers });
    }
}
