export async function onRequestGet(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 100;
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const clickId = url.searchParams.get('clickId');
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!db) {
        return new Response(JSON.stringify({ error: 'Database connection error' }), { status: 500, headers });
    }

    try {
        let query = 'SELECT * FROM conversions';
        let conditions = [];
        let params = [];

        if (startDate && endDate) {
            conditions.push('created_at BETWEEN ? AND ?');
            params.push(startDate, endDate);
        }

        if (clickId) {
            conditions.push('click_id = ?');
            params.push(clickId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        const { results } = await db.prepare(query).bind(...params).all();

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
