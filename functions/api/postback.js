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
        const clickId = params.click_id || params.clickid || params.cid || params.track || null;
        let payout = parseFloat(params.payout || params.sum || '0.00');
        if (isNaN(payout)) payout = 0;
        const trafficType = (params.os || params.traffic || 'WEB').toUpperCase().substring(0, 5);
        let subId = params.sub_id || params.subid || params.smartlink || 'Unknown';
        const network = (params.network || params.source || (params.track ? 'TRAFEE' : 'IMONETIZEIT')).toUpperCase();
        const countryCode = (params.country || params.geo || 'XX').toUpperCase().substring(0, 2);
        
        const paramIp = params.ip || params.ip_address || null;
        const ip = paramIp || context.request.headers.get('cf-connecting-ip') || '0.0.0.0';
        let userAgent = context.request.headers.get('user-agent') || '';

        if (!clickId && subId === 'Unknown') {
            return new Response(JSON.stringify({ error: 'Missing clickid or smartlink' }), { status: 400, headers });
        }

        let finalTrafficType = trafficType;
        let finalCountryCode = countryCode;
        let finalIp = ip;

        // 0. Auto-Attribution: Look up the real Team Member and User Details from D1 clicks table
        if (clickId) {
            const clickInfo = await db.prepare(`
                SELECT slug, user_id, ip_address, os, country, browser FROM clicks WHERE click_id = ? OR id = ? LIMIT 1
            `).bind(clickId, clickId).first();
            
            if (clickInfo) {
                subId = clickInfo.user_id || clickInfo.slug || subId; // Use user_id if available
                
                // Override OS and Browser for all networks because postback payload usually lacks them
                if (clickInfo.os) finalTrafficType = clickInfo.os;
                if (clickInfo.browser) userAgent = clickInfo.browser;
                
                // Only override IP/Country from DB if network is Trafee
                if (network === 'TRAFEE') {
                    if (clickInfo.ip_address) finalIp = clickInfo.ip_address;
                    if (clickInfo.country) finalCountryCode = clickInfo.country.toUpperCase().substring(0, 2);
                }
            }
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
            finalCountryCode,
            finalTrafficType,
            payout,
            finalIp,
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
