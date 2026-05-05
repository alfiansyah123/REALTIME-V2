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
            'USA': 'US', 'U.S.A.': 'US', 'U.S.': 'US', 'AMERICA': 'US', 'UNITED STATES': 'US',
            'UK': 'GB', 'GREAT BRITAIN': 'GB', 'ENGLAND': 'GB', 'UNITED KINGDOM': 'GB',
            'MEXICO': 'MX', 'MEX': 'MX', 'GERMANY': 'DE', 'DEU': 'DE', 'FRANCE': 'FR', 'FRA': 'FR',
            'SPAIN': 'ES', 'ESP': 'ES', 'ITALY': 'IT', 'ITA': 'IT', 'BRAZIL': 'BR', 'BRA': 'BR',
            'JAPAN': 'JP', 'JPN': 'JP', 'CHINA': 'CN', 'CHN': 'CN', 'INDIA': 'IN', 'IND': 'IN',
            'RUSSIA': 'RU', 'RUS': 'RU', 'INDONESIA': 'ID', 'IDN': 'ID', 'NETHERLANDS': 'NL', 'NLD': 'NL',
            'TURKEY': 'TR', 'TUR': 'TR', 'UKRAINE': 'UA', 'UKR': 'UA', 'CANADA': 'CA', 'CAN': 'CA',
            'AUSTRALIA': 'AU', 'AUS': 'AU', 'PAKISTAN': 'PK', 'PAK': 'PK', 'DOMINICAN REPUBLIC': 'DO', 'DOM': 'DO',
            'TANZANIA': 'TZ', 'TANZANIA, UNITED REPUBLIC OF': 'TZ', 'PHL': 'PH', 'PHILIPPINES': 'PH',
            'THAILAND': 'TH', 'THA': 'TH', 'MALAYSIA': 'MY', 'MYS': 'MY', 'SINGAPORE': 'SG', 'SGP': 'SG',
            'VIETNAM': 'VN', 'VNM': 'VN', 'SOUTH KOREA': 'KR', 'KOR': 'KR', 'ARGENTINA': 'AR', 'ARG': 'AR',
            'CHILE': 'CL', 'CHL': 'CL', 'COLOMBIA': 'CO', 'COL': 'CO', 'PERU': 'PE', 'PER': 'PE',
            'SOUTH AFRICA': 'ZA', 'ZAF': 'ZA', 'EGYPT': 'EG', 'EGY': 'EG', 'UAE': 'AE', 'ARE': 'AE',
            'SAUDI ARABIA': 'SA', 'SAU': 'SA', 'POLAND': 'PL', 'POL': 'PL', 'SWEDEN': 'SE', 'SWE': 'SE',
            'HAITI': 'HT', 'HTI': 'HT', 'JAMAICA': 'JM', 'JAM': 'JM', 'NIGERIA': 'NG', 'NGA': 'NG'
        };
        
        let countryCode = countryMap[rawCountry] || (rawCountry.length === 2 ? rawCountry : 'XX');
        // Fallback: Jika dapet dari map/2 huruf, pakai itu. Kalau enggak, munculin aslinya aja daripada XX
        let countryName = countryCode !== 'XX' ? countryCode : rawCountry;
        
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

        // --- DETEKSI FALLBACK (Jika lookup gagal) ---
        function detectUA(uaString) {
            const ua = (uaString || '').toLowerCase();
            let browser = 'Other';
            let os = 'Other';

            if (ua.includes('fbav') || ua.includes('fban') || ua.includes('fbiab')) browser = 'Facebook';
            else if (ua.includes('instagram')) browser = 'Instagram';
            else if (ua.includes('tiktok')) browser = 'TikTok';
            else if (ua.includes('whatsapp')) browser = 'WhatsApp';
            else if (ua.includes('chrome')) browser = 'Chrome';
            else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
            else if (ua.includes('firefox')) browser = 'Firefox';

            if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
            else if (ua.includes('android')) os = 'Android';
            else if (ua.includes('windows')) os = 'Windows';
            else if (ua.includes('mac os')) os = 'macOS';
            else if (ua.includes('linux')) os = 'Linux';

            return { browser, os };
        }

        // 0. Auto-Attribution: Look up the real Team Member and User Details from D1 clicks table
        if (clickId) {
            // Try lookup by multiple fields to be resilient
            const clickInfo = await db.prepare(`
                SELECT user_id, ip_address, os, country, browser, user_agent 
                FROM clicks 
                WHERE click_id = ? OR slug = ? OR id = ? 
                ORDER BY created_at DESC LIMIT 1
            `).bind(clickId, clickId, clickId).first();
            
            if (clickInfo) {
                subId = clickInfo.user_id || subId;
                finalOs = clickInfo.os || 'Unknown';
                finalBrowser = clickInfo.browser || 'Unknown';
                
                // BOM! Senjata Rahasia: Timpa country abal-abal dari iMonetizeIt dengan country ASLI dari Cloudflare
                if (clickInfo.country && clickInfo.country !== 'XX') {
                    countryCode = clickInfo.country;
                    countryName = clickInfo.country;
                }
                
                // Gunakan User Agent ASLI dari klik, bukan dari server postback
                userAgent = clickInfo.user_agent || userAgent;
                
                if (network === 'TRAFEE' && clickInfo.ip_address) {
                    finalIp = clickInfo.ip_address;
                }
            } else {
                // FALLBACK: If click not found, try to detect from current headers (though likely server UA)
                // but at least we don't leave it NULL
                const detected = detectUA(userAgent);
                finalBrowser = detected.browser;
                finalOs = detected.os;
            }
        }

        // Final sanity check for Traffic Type
        if (finalOs !== 'Unknown') {
            const osLow = finalOs.toLowerCase();
            if (osLow.includes('android') || osLow.includes('ios') || osLow.includes('iphone') || osLow.includes('mobile')) {
                finalTrafficType = 'WAP';
            } else {
                finalTrafficType = 'WEB';
            }
        }

        const finalClickId = clickId || subId || `gen-${crypto.randomUUID()}`;

        // 1. Insert into conversions (Resilient)
        try {
            await db.prepare(`
                INSERT OR IGNORE INTO conversions (click_id, sub_id, network, country, country_name, traffic_type, earning, ip_address, user_agent, os, browser)
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
        } catch (e) {
            console.error('Conversions Insert Error:', e.message);
            // Fallback for older schema if os/browser columns are missing
            try {
                await db.prepare(`
                    INSERT OR IGNORE INTO conversions (click_id, sub_id, network, country, country_name, traffic_type, earning, ip_address, user_agent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(finalClickId, subId, network, finalCountryCode, finalCountryName, finalTrafficType, payout, finalIp, userAgent).run();
            } catch (e2) {}
        }

        // 2. Atomic Upsert into daily_reports
        const today = new Date().toISOString().split('T')[0];
        try {
            await db.prepare(`
                INSERT INTO daily_reports (date, smartlink, network, leads, payout)
                VALUES (?, ?, ?, 1, ?)
                ON CONFLICT(date, smartlink, network) DO UPDATE SET
                leads = leads + 1,
                payout = payout + EXCLUDED.payout,
                updated_at = CURRENT_TIMESTAMP
            `).bind(today, subId, network, payout).run();
        } catch (e) {
            console.error('Daily Reports Error:', e.message);
        }

        return new Response('OK', { status: 200, headers });

    } catch (error) {
        console.error('Global Postback Error:', error);
        return new Response('ERROR', { status: 500, headers });
    }
}
