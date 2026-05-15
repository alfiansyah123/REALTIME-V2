export async function onRequest(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 200;
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (!db) {
        return new Response(JSON.stringify({ error: 'Database connection error', data: [] }), { status: 500, headers });
    }

    try {
        // Fetch clicks from D1 sorted by ID or created_at
        // Using SQLite syntax
        const { results } = await db.prepare(`
            SELECT id, slug, country, ip_address, created_at, os, browser, click_id, network, s3, user_id, referer 
            FROM clicks 
            ORDER BY created_at DESC 
            LIMIT ?
        `).bind(limit).all();

        return new Response(JSON.stringify({ 
            success: true, 
            data: results || [] 
        }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message, 
            data: [] 
        }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
