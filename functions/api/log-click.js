export async function onRequest(context) {
    const db = context.env.DB;
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!db) return new Response(JSON.stringify({ error: 'DB not found' }), { status: 500, headers });

    try {
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
            is_bot 
        } = body;

        // Skip if it's a bot (optional, based on your preference)
        if (is_bot) return new Response(JSON.stringify({ success: true, skipped: 'bot' }), { status: 200, headers });

        await db.prepare(`
            INSERT INTO clicks (
                slug, country, ip_address, user_agent, browser, os, device, click_id, referer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            slug || '-', 
            country || 'XX', 
            ip_address || '0.0.0.0', 
            user_agent || '', 
            browser || '', 
            os || '', 
            device || '', 
            click_id || null, 
            referer || ''
        ).run();

        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}
