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
        let clickId = params.click_id || params.clickid || params.ext_click_id || params.cid || params.track || null;
        
        // Clean up placeholders if they weren't replaced by the network
        if (clickId && (clickId.includes('<') || clickId.includes('{') || clickId === 'click_id')) {
            clickId = null;
        }

        let payout = parseFloat(params.payout || params.sum || '0.00');
        if (isNaN(payout)) payout = 0;
        const trafficType = (params.os || params.traffic || 'WEB').toUpperCase();
        
        let subId = params.sub_id || params.subid || 'Unknown';
        
        // Use smartlink name as subId only if it's a valid ID (not a long country list)
        const smartName = params.smartlink || '';
        if (subId === 'Unknown' && smartName && smartName.length < 50 && !smartName.includes(',')) {
            subId = smartName;
        }

        const network = (params.network || params.source || (params.track || params.ext_click_id ? 'TRAFEE' : 'IMONETIZEIT')).toUpperCase();
        
        // Handle Full Country Names & 3-Letter Codes
        let rawCountry = (params.country || params.geo || 'XX').toUpperCase().trim();
        
        // Clean up placeholders like <country> or {country}
        if (rawCountry.includes('<') || rawCountry.includes('{') || rawCountry.includes('COUNTRY')) {
            rawCountry = 'XX';
        }

        const countryMap = {
            // ISO 3-letter to 2-letter
            'AFG': 'AF', 'ALB': 'AL', 'DZA': 'DZ', 'ASM': 'AS', 'AND': 'AD', 'AGO': 'AO', 'AIA': 'AI', 'ATA': 'AQ', 'ATG': 'AG', 'ARG': 'AR',
            'ARM': 'AM', 'ABW': 'AW', 'AUS': 'AU', 'AUT': 'AT', 'AZE': 'AZ', 'BHS': 'BS', 'BHR': 'BH', 'BGD': 'BD', 'BRB': 'BB', 'BLR': 'BY',
            'BEL': 'BE', 'BLZ': 'BZ', 'BEN': 'BJ', 'BMU': 'BM', 'BTN': 'BT', 'BOL': 'BO', 'BIH': 'BA', 'BWA': 'BW', 'BVT': 'BV', 'BRA': 'BR',
            'IOT': 'IO', 'BRN': 'BN', 'BGR': 'BG', 'BFA': 'BF', 'BDI': 'BI', 'KHM': 'KH', 'CMR': 'CM', 'CAN': 'CA', 'CPV': 'CV', 'CYM': 'KY',
            'CAF': 'CF', 'TCD': 'TD', 'CHL': 'CL', 'CHN': 'CN', 'CXR': 'CX', 'CCK': 'CC', 'COL': 'CO', 'COM': 'KM', 'COG': 'CG', 'COD': 'CD',
            'COK': 'CK', 'CRI': 'CR', 'CIV': 'CI', 'HRV': 'HR', 'CUB': 'CU', 'CYP': 'CY', 'CZE': 'CZ', 'DNK': 'DK', 'DJI': 'DJ', 'DMA': 'DM',
            'DOM': 'DO', 'ECU': 'EC', 'EGY': 'EG', 'SLV': 'SV', 'GNQ': 'GQ', 'ERI': 'ER', 'EST': 'EE', 'ETH': 'ET', 'FLK': 'FK', 'FRO': 'FO',
            'FJI': 'FJ', 'FIN': 'FI', 'FRA': 'FR', 'GUF': 'GF', 'PYF': 'PF', 'ATF': 'TF', 'GAB': 'GA', 'GMB': 'GM', 'GEO': 'GE', 'DEU': 'DE',
            'GHA': 'GH', 'GIB': 'GI', 'GRC': 'GR', 'GRL': 'GL', 'GRD': 'GD', 'GLP': 'GP', 'GUM': 'GU', 'GTM': 'GT', 'GIN': 'GN', 'GNB': 'GW',
            'GUY': 'GY', 'HTI': 'HT', 'HMD': 'HM', 'VAT': 'VA', 'HND': 'HN', 'HKG': 'HK', 'HUN': 'HU', 'ISL': 'IS', 'IND': 'IN', 'IDN': 'ID',
            'IRN': 'IR', 'IRQ': 'IQ', 'IRL': 'IE', 'ISR': 'IL', 'ITA': 'IT', 'JAM': 'JM', 'JPN': 'JP', 'JOR': 'JO', 'KAZ': 'KZ', 'KEN': 'KE',
            'KIR': 'KI', 'PRK': 'KP', 'KOR': 'KR', 'KWT': 'KW', 'KGZ': 'KG', 'LAO': 'LA', 'LVA': 'LV', 'LBN': 'LB', 'LSO': 'LS', 'LBR': 'LR',
            'LBY': 'LY', 'LIE': 'LI', 'LTU': 'LT', 'LUX': 'LU', 'MAC': 'MO', 'MKD': 'MK', 'MDG': 'MG', 'MWI': 'MW', 'MYS': 'MY', 'MDV': 'MV',
            'MLI': 'ML', 'MLT': 'MT', 'MHL': 'MH', 'MTQ': 'MQ', 'MRT': 'MR', 'MUS': 'MU', 'MYT': 'YT', 'MEX': 'MX', 'FSM': 'FM', 'MDA': 'MD',
            'MCO': 'MC', 'MNG': 'MN', 'MSR': 'MS', 'MAR': 'MA', 'MOZ': 'MZ', 'MMR': 'MM', 'NAM': 'NA', 'NRU': 'NR', 'NPL': 'NP', 'NLD': 'NL',
            'ANT': 'AN', 'NCL': 'NC', 'NZL': 'NZ', 'NIC': 'NI', 'NER': 'NE', 'NGA': 'NG', 'NIU': 'NU', 'NFK': 'NF', 'MNP': 'MP', 'NOR': 'NO',
            'OMN': 'OM', 'PAK': 'PK', 'PLW': 'PW', 'PSE': 'PS', 'PAN': 'PA', 'PNG': 'PG', 'PRY': 'PY', 'PER': 'PE', 'PHL': 'PH', 'PCN': 'PN',
            'POL': 'PL', 'PRT': 'PT', 'PRI': 'PR', 'QAT': 'QA', 'REU': 'RE', 'ROU': 'RO', 'RUS': 'RU', 'RWA': 'RW', 'SHN': 'SH', 'KNA': 'KN',
            'LCA': 'LC', 'SPM': 'PM', 'VCT': 'VC', 'WSM': 'WS', 'SMR': 'SM', 'STP': 'ST', 'SAU': 'SA', 'SEN': 'SN', 'SCG': 'CS', 'SYC': 'SC',
            'SLE': 'SL', 'SGP': 'SG', 'SVK': 'SK', 'SVN': 'SI', 'SLB': 'SB', 'SOM': 'SO', 'ZAF': 'ZA', 'SGS': 'GS', 'ESP': 'ES', 'LKA': 'LK',
            'SDN': 'SD', 'SUR': 'SR', 'SJM': 'SJ', 'SWZ': 'SZ', 'SWE': 'SE', 'CHE': 'CH', 'SYR': 'SY', 'TWN': 'TW', 'TJK': 'TJ', 'TZA': 'TZ',
            'THA': 'TH', 'TLS': 'TL', 'TGO': 'TG', 'TKL': 'TK', 'TON': 'TO', 'TTO': 'TT', 'TUN': 'TN', 'TUR': 'TR', 'TKM': 'TM', 'TCA': 'TC',
            'TUV': 'TV', 'UGA': 'UG', 'UKR': 'UA', 'ARE': 'AE', 'GBR': 'GB', 'USA': 'US', 'UMI': 'UM', 'URY': 'UY', 'UZB': 'UZ', 'VUT': 'VU',
            'VEN': 'VE', 'VNM': 'VN', 'VGB': 'VG', 'VIR': 'VI', 'WLF': 'WF', 'ESH': 'EH', 'YEM': 'YE', 'ZMB': 'ZM', 'ZWE': 'ZW',
            // Full Names to 2-letter
            'UNITED STATES': 'US', 'UNITED KINGDOM': 'GB', 'GREAT BRITAIN': 'GB', 'MEXICO': 'MX', 'GERMANY': 'DE', 'FRANCE': 'FR', 'SPAIN': 'ES',
            'ITALY': 'IT', 'BRAZIL': 'BR', 'JAPAN': 'JP', 'CHINA': 'CN', 'INDIA': 'IN', 'RUSSIA': 'RU', 'INDONESIA': 'ID', 'NETHERLANDS': 'NL',
            'TURKEY': 'TR', 'UKRAINE': 'UA', 'CANADA': 'CA', 'AUSTRALIA': 'AU', 'PAKISTAN': 'PK', 'PHILIPPINES': 'PH', 'THAILAND': 'TH',
            'MALAYSIA': 'MY', 'SINGAPORE': 'SG', 'VIETNAM': 'VN', 'SOUTH KOREA': 'KR', 'ARGENTINA': 'AR', 'CHILE': 'CL', 'COLOMBIA': 'CO',
            'SOUTH AFRICA': 'ZA', 'UAE': 'AE', 'SAUDI ARABIA': 'SA', 'POLAND': 'PL', 'SWEDEN': 'SE', 'HAITI': 'HT', 'JAMAICA': 'JM',
            'NIGERIA': 'NG', 'AUSTRIA': 'AT', 'BELGIUM': 'BE', 'SWITZERLAND': 'CH', 'GREECE': 'GR', 'NORWAY': 'NO', 'PORTUGAL': 'PT',
            'ISRAEL': 'IL', 'MOROCCO': 'MA', 'ALGERIA': 'DZ', 'TUNISIA': 'TN', 'KENYA': 'KE'
        };
        
        let countryCode = countryMap[rawCountry] || (rawCountry.length === 2 ? rawCountry : 'XX');
        let countryName = countryCode !== 'XX' ? countryCode : rawCountry;
        
        const paramIp = params.ip || params.ip_address || null;
        let finalIp = paramIp || context.request.headers.get('cf-connecting-ip') || '0.0.0.0';
        let userAgent = context.request.headers.get('user-agent') || '';

        if (!clickId && subId === 'Unknown') {
            return new Response(JSON.stringify({ error: 'Missing clickid' }), { status: 400, headers });
        }

        let finalTrafficType = trafficType;
        let finalCountryCode = countryCode;
        let finalCountryName = countryName;
        let finalOs = 'Unknown';
        let finalBrowser = 'Unknown';

        // --- DETEKSI FALLBACK ---
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

        // 0. Auto-Attribution
        if (clickId) {
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
                
                // PRIORITAS: Selalu percaya data negara dari Network (Trafee/iMonetizeIt)
                // Cuma pake data klik awal kalau network kirim "XX" atau kosong.
                if (finalCountryCode === 'XX' || !finalCountryCode) {
                    if (clickInfo.country && clickInfo.country !== 'XX') {
                        finalCountryCode = clickInfo.country;
                        finalCountryName = clickInfo.country;
                    }
                }
                
                userAgent = clickInfo.user_agent || userAgent;
                
                if (network === 'TRAFEE' && clickInfo.ip_address) {
                    finalIp = clickInfo.ip_address;
                }
            } else {
                const detected = detectUA(userAgent);
                finalBrowser = detected.browser;
                finalOs = detected.os;
            }

            // --- SMART GEO-CORRECTION ---
            if (finalCountryCode === 'US' || finalCountryCode === 'XX') {
                if (finalIp.startsWith('181.115.') || finalIp.startsWith('190.113.')) {
                    finalCountryCode = 'GT';
                    finalCountryName = 'GT';
                }
            }
        }

        if (finalOs !== 'Unknown') {
            const osLow = finalOs.toLowerCase();
            if (osLow.includes('android') || osLow.includes('ios') || osLow.includes('iphone') || osLow.includes('mobile')) {
                finalTrafficType = 'WAP';
            } else {
                finalTrafficType = 'WEB';
            }
        }

        const finalClickId = clickId || `gen-${crypto.randomUUID().split('-')[0]}`;

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
            try {
                await db.prepare(`
                    INSERT OR IGNORE INTO conversions (click_id, sub_id, network, country, country_name, traffic_type, earning, ip_address, user_agent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(finalClickId, subId, network, finalCountryCode, finalCountryName, finalTrafficType, payout, finalIp, userAgent).run();
            } catch (e2) {}
        }

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

        return new Response(JSON.stringify({ success: true, click_id: finalClickId, network, country: finalCountryCode }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
