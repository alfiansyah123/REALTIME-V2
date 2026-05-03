export async function onRequestGet(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const targetDate = url.searchParams.get('date'); // YYYY-MM-DD
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!db) {
        return new Response(JSON.stringify({ error: 'Database connection error' }), { status: 500, headers });
    }

    try {
        const startOfDay = `${targetDate}T00:00:00.000Z`;
        const endOfDay = `${targetDate}T23:59:59.999Z`;

        const { results } = await db.prepare(`
            SELECT 
                country,
                COUNT(*) as leads
            FROM conversions
            WHERE created_at BETWEEN ? AND ?
            GROUP BY country
            ORDER BY leads DESC
            LIMIT 10
        `).bind(startOfDay, endOfDay).all();

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
