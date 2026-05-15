export async function onRequestGet(context) {
    const db = context.env.DB;
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!db) return new Response(JSON.stringify({ error: 'DB not found' }), { status: 500, headers });

    try {
        // 1. Tambah Index untuk Clicks (Biar sorting DESC cepet)
        await db.prepare(`CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks (created_at DESC)`).run();
        
        // 2. Tambah Index untuk Conversions
        await db.prepare(`CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions (created_at DESC)`).run();
        
        // 3. Tambah Index untuk Pencarian Click ID (Penting buat Postback)
        await db.prepare(`CREATE INDEX IF NOT EXISTS idx_clicks_click_id ON clicks (click_id)`).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Database optimized successfully! Your dashboard should be faster now.' 
        }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}
