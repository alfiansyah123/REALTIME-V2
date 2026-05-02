export async function onRequestGet(context) {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!db) {
        return new Response(JSON.stringify({ error: 'Database connection error' }), { status: 500, headers });
    }

    try {
        // Extract & Normalize Parameters
        const clickId = params.click_id || params.clickid || params.cid || null;
        const payout = parseFloat(params.payout || params.sum || '0.00');
        const trafficType = (params.os || params.traffic || 'WEB').toUpperCase().substring(0, 5);
        const subId = params.sub_id || params.subid || params.smartlink || params.click_id || 'Unknown';
        const network = params.network || params.source || 'IMONETIZEIT';
        const countryCode = (params.country || params.geo || 'XX').toUpperCase().substring(0, 2);
        
        const ip = context.request.headers.get('cf-connecting-ip') || '0.0.0.0';
        const userAgent = context.request.headers.get('user-agent') || '';

        if (!clickId && subId === 'Unknown') {
            return new Response(JSON.stringify({ error: 'Missing clickid or smartlink' }), { status: 400, headers });
        }

        const finalClickId = clickId || subId || `gen-${crypto.randomUUID()}`;

        // 1. Insert into conversions
        await db.prepare(`
            INSERT INTO conversions (click_id, sub_id, network, country, traffic_type, earning, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            finalClickId,
            subId,
            network,
            countryCode,
            trafficType,
            payout,
            ip,
            userAgent
        ).run();

        // 2. Atomic Upsert into daily_reports
        const today = new Date().toISOString().split('T')[0];
        
        await db.prepare(`
            INSERT INTO daily_reports (date, smartlink, network, leads, payout)
            VALUES (?, ?, ?, 1, ?)
            ON CONFLICT(date, smartlink, network) DO UPDATE SET
            leads = leads + 1,
            payout = payout + EXCLUDED.payout,
            updated_at = CURRENT_TIMESTAMP
        `).bind(today, subId, network, payout).run();

        return new Response(JSON.stringify({ success: true, message: 'Conversion recorded', id: finalClickId }), { status: 200, headers });

    } catch (error) {
        console.error('Postback Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}
