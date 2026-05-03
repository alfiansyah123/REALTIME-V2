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

        const finalUserId = slug || body.user_id || '-';
        const finalClickId = click_id || body.track || null;

        await db.prepare(`
            INSERT INTO clicks (
                slug, user_id, country, ip_address, user_agent, browser, os, device, click_id, referer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            finalUserId,
            finalUserId,
            country || 'XX', 
            ip_address || '0.0.0.0', 
            user_agent || '', 
            browser || '', 
            os || '', 
            device || '', 
            finalClickId, 
            referer || ''
        ).run();

        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}
