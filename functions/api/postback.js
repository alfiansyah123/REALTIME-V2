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
        let rawCountry = (params.country || params.geo || 'XX').toUpperCase();
        const countryMap = {
            'USA': 'US', 'UK': 'GB', 'UN': 'US', 'EN': 'GB', 'GREAT BRITAIN': 'GB',
            'UKR': 'UA', 'UKRAINE': 'UA', 'RUS': 'RU', 'RUSSIA': 'RU',
            'VNM': 'VN', 'VIETNAM': 'VN', 'IDN': 'ID', 'INDONESIA': 'ID',
            'BRA': 'BR', 'BRAZIL': 'BR', 'THA': 'TH', 'THAILAND': 'TH',
            'DEU': 'DE', 'GERMANY': 'DE', 'FRA': 'FR', 'FRANCE': 'FR',
            'ESP': 'ES', 'SPAIN': 'ES', 'ITA': 'IT', 'ITALY': 'IT',
            'NLD': 'NL', 'HOLLAND': 'NL', 'NETHERLANDS': 'NL',
            'SGP': 'SG', 'SINGAPORE': 'SG', 'MYS': 'MY', 'MALAYSIA': 'MY',
            'PHL': 'PH', 'PHILIPPINES': 'PH', 'KOR': 'KR', 'SOUTH KOREA': 'KR',
            'JPN': 'JP', 'JAPAN': 'JP', 'CHN': 'CN', 'CHINA': 'CN',
            'IND': 'IN', 'INDIA': 'IN', 'CAN': 'CA', 'CANADA': 'CA',
            'AUS': 'AU', 'AUSTRALIA': 'AU', 'MEX': 'MX', 'MEXICO': 'MX',
            'ARG': 'AR', 'ARGENTINA': 'AR', 'COL': 'CO', 'COLOMBIA': 'CO',
            'ZAF': 'ZA', 'SOUTH AFRICA': 'ZA', 'EGY': 'EG', 'EGYPT': 'EG',
            'SAU': 'SA', 'SAUDI ARABIA': 'SA', 'ARE': 'AE', 'UAE': 'AE',
            'TUR': 'TR', 'TURKEY': 'TR', 'PAK': 'PK', 'PAKISTAN': 'PK',
            'NGA': 'NG', 'NIGERIA': 'NG', 'KEN': 'KE', 'KENYA': 'KE',
            'GHA': 'GH', 'GHANA': 'GH', 'MAR': 'MA', 'MOROCCO': 'MA',
            'DZA': 'DZ', 'ALGERIA': 'DZ', 'TUN': 'TN', 'TUNISIA': 'TN',
            'PER': 'PE', 'PERU': 'PE', 'CHL': 'CL', 'CHILE': 'CL',
            'VEN': 'VE', 'VENEZUELA': 'VE', 'ECU': 'EC', 'ECUADOR': 'EC',
            'DOM': 'DO', 'DOMINICAN REPUBLIC': 'DO', 'CUB': 'CU', 'CUBA': 'CU'
        };
        
        let countryCode = countryMap[rawCountry] || rawCountry.substring(0, 2);
        let countryName = rawCountry.length > 2 ? rawCountry : null;
        
        const paramIp = params.ip || params.ip_address || null;
        const ip = paramIp || context.request.headers.get('cf-connecting-ip') || '0.0.0.0';
        let userAgent = context.request.headers.get('user-agent') || '';

        if (!clickId && subId === 'Unknown') {
            return new Response(JSON.stringify({ error: 'Missing clickid or smartlink' }), { status: 400, headers });
        }

        let finalTrafficType = trafficType;
        let finalCountryCode = countryCode;
        let finalCountryName = countryName;
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
                
                // Use tracker country for ALL networks since it is always a valid ISO-2 code (Cloudflare cf.country)
                if (clickInfo.country) finalCountryCode = clickInfo.country.toUpperCase().substring(0, 2);
                
                // Only override IP from DB if network is Trafee (because iMonetizeIt IP is already accurate)
                if (network === 'TRAFEE') {
                    if (clickInfo.ip_address) finalIp = clickInfo.ip_address;
                }
                
                // Set country name from DB if we don't have it
                if (!finalCountryName && finalCountryCode === 'US') finalCountryName = 'United States';
                if (!finalCountryName && finalCountryCode === 'ID') finalCountryName = 'Indonesia';
            }
        }

        const finalClickId = clickId || subId || `gen-${crypto.randomUUID()}`;

        // 1. Insert into conversions
        await db.prepare(`
            INSERT INTO conversions (click_id, sub_id, network, country, country_name, traffic_type, earning, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            finalClickId,
            subId,
            network,
            finalCountryCode,
            finalCountryName,
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
