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
        const trafficType = (params.os || params.traffic || 'WEB').toUpperCase();
        let subId = params.sub_id || params.subid || params.smartlink || 'Unknown';
        const network = (params.network || params.source || (params.track ? 'TRAFEE' : 'IMONETIZEIT')).toUpperCase();
        
        // Handle Full Country Names (iMonetizeIt fallback)
        let rawCountry = (params.country || params.geo || 'XX').toUpperCase().trim();
        const countryMap = {
            'USA': 'US', 'U.S.A.': 'US', 'UNITED STATES': 'US',
            'UK': 'GB', 'GREAT BRITAIN': 'GB', 'UNITED KINGDOM': 'GB',
            'MEXICO': 'MX', 'GERMANY': 'DE', 'FRANCE': 'FR', 'SPAIN': 'ES', 'ITALY': 'IT',
            'BRAZIL': 'BR', 'JAPAN': 'JP', 'CHINA': 'CN', 'INDIA': 'IN', 'RUSSIA': 'RU',
            'INDONESIA': 'ID', 'NETHERLANDS': 'NL', 'TURKEY': 'TR', 'UKRAINE': 'UA'
        };
        
        let countryCode = countryMap[rawCountry] || (rawCountry.length === 2 ? rawCountry : 'XX');
        let countryName = rawCountry.length > 2 ? rawCountry : null;
        
        const paramIp = params.ip || params.ip_address || null;
        const ip = paramIp || context.request.headers.get('cf-connecting-ip') || '0.0.0.0';
        let userAgent = context.request.headers.get('user-agent') || '';

        if (!clickId && subId === 'Unknown') {
            return new Response(JSON.stringify({ error: 'Missing clickid' }), { status: 400, headers });
        }

        let finalTrafficType = trafficType;
        let finalCountryCode = countryCode;
        let finalCountryName = countryName;
        let finalIp = ip;
        let finalOs = 'Unknown';
        let finalBrowser = 'Unknown';

        // 0. Auto-Attribution: Look up the real Team Member and User Details from D1 clicks table
        if (clickId) {
            // Try lookup by click_id first
            const clickInfo = await db.prepare(`
                SELECT user_id, ip_address, os, country, browser FROM clicks 
                WHERE click_id = ? OR slug = ? OR id = ? 
                LIMIT 1
            `).bind(clickId, clickId, clickId).first();
            
            if (clickInfo) {
                subId = clickInfo.user_id || subId;
                finalOs = clickInfo.os || 'Unknown';
                finalBrowser = clickInfo.browser || 'Unknown';
                
                // Determine WAP/WEB based on original OS
                if (finalOs !== 'Unknown') {
                    const osLow = finalOs.toLowerCase();
                    if (osLow.includes('android') || osLow.includes('iphone') || osLow.includes('ipad') || osLow.includes('mobile')) {
                        finalTrafficType = 'WAP';
                    } else {
                        finalTrafficType = 'WEB';
                    }
                    userAgent = `${finalOs} | ${finalBrowser}`;
                }
                
                if (clickInfo.country && clickInfo.country.length === 2) {
                    finalCountryCode = clickInfo.country.toUpperCase();
                }
                
                if (network === 'TRAFEE' && clickInfo.ip_address) {
                    finalIp = clickInfo.ip_address;
                }
            }
        }

        const finalClickId = clickId || subId || `gen-${crypto.randomUUID()}`;

        // 1. Insert into conversions (Now with os and browser columns)
        await db.prepare(`
            INSERT INTO conversions (click_id, sub_id, network, country, country_name, traffic_type, earning, ip_address, user_agent, os, browser)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            finalClickId,
            subId,
            network,
            finalCountryCode,
            finalCountryName,
            finalTrafficType,
            payout,
            finalIp,
            userAgent,
            finalOs,
            finalBrowser
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
