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

    try {
        // Fetch stats only for TRAFEE from D1
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
            ORDER BY payouts DESC
        `).bind(startDate, endDate).all();

        const data = d1Stats.map(row => ({
            ...row,
            smartlink: row.smartlink || row.slug,
            visits: 0, // Hidden in UI later
            unique: 0  // Hidden in UI later
        }));

        return new Response(JSON.stringify({ data }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, data: [] }), { status: 500, headers });
    }
}
