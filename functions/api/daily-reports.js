export async function onRequestGet(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!db) {
        return new Response(JSON.stringify({ error: 'Database connection error' }), { status: 500, headers });
    }

    try {
        // Query to aggregate reports from D1 daily_reports table
        // D1 table uses SQLite
        const { results } = await db.prepare(`
            SELECT 
                smartlink,
                network,
                SUM(visits) as visits,
                SUM(unique_visits) as unique,
                SUM(clicks) as clicks,
                SUM(leads) as leads,
                SUM(payout) as payouts
            FROM daily_reports
            WHERE date BETWEEN ? AND ?
            GROUP BY smartlink, network
            ORDER BY payouts DESC
        `).bind(startDate, endDate).all();

        return new Response(JSON.stringify({ data: results }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
