export async function onRequest(context) {
    const db = context.env.DB;
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!db) return new Response(JSON.stringify({ error: 'DB not found' }), { status: 500, headers });

    try {
        // --- AUTO-OPTIMIZE DATABASE ---
        // Jalankan perintah index otomatis biar dashboard kenceng tanpa harus buka link manual
        context.waitUntil((async () => {
            try {
                await db.prepare(`CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks (created_at DESC)`).run();
                await db.prepare(`CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions (created_at DESC)`).run();
                await db.prepare(`CREATE INDEX IF NOT EXISTS idx_clicks_click_id ON clicks (click_id)`).run();
            } catch (e) {}
        })());
        // ------------------------------

        const body = await context.request.json();
        const { 
            slug, 
            country, 
            ip_address, 
            user_agent, 
            browser, 
            os, 
            device, 
            click_id, 
            referer,
            network,
            is_bot 
        } = body;

        // Skip if it's a bot (optional, based on your preference)
        if (is_bot) return new Response(JSON.stringify({ success: true, skipped: 'bot' }), { status: 200, headers });

        let memberName = body.user_id || body.username || body.member_name || 'Unknown';
        const linkSlug = slug || body.slug || 'Unknown';
        let finalClickId = click_id || body.track || null;

        // --- ANTI-JUNK FILTER ---
        // Jika clickId atau memberName mengandung daftar negara (koma) atau kepanjangan, bersihkan.
        if (finalClickId && (finalClickId.includes(',') || finalClickId.includes('%2C') || finalClickId.length > 50)) {
            finalClickId = null; 
        }
        if (memberName && (memberName.includes(',') || memberName.includes('%2C') || memberName.length > 50)) {
            memberName = 'Unknown';
        }
        // -------------------------

        const finalNetwork = network || (finalClickId ? (finalClickId.startsWith('gen-') ? 'TRACKER' : 'NETWORK') : 'UNKNOWN');

        await db.prepare(`
            INSERT INTO clicks (
                slug, user_id, country, ip_address, user_agent, browser, os, device, click_id, referer, network
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            linkSlug,
            memberName,
            country || context.request.cf?.country || 'XX', 
            ip_address || context.request.headers.get('cf-connecting-ip') || '0.0.0.0', 
            user_agent || '', 
            browser || '', 
            os || '', 
            device || '', 
            finalClickId, 
            referer || '',
            finalNetwork
        ).run();

        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}
