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
            // Priority Typos & Special mappings
            'USA': 'US', 'U.S.A.': 'US', 'U.S.': 'US', 'AMERICA': 'US', 'UNITED STATES': 'US',
            'UK': 'GB', 'GREAT BRITAIN': 'GB', 'ENGLAND': 'GB', 'UNITED KINGDOM': 'GB', 'SCOTLAND': 'GB', 'WALES': 'GB', 'NORTHERN IRELAND': 'GB',
            'UN': 'US',  // Common typo for US
            'ME': 'MX',  // Common typo for Mexico
            'EN': 'GB',  // England
            'ENGLAND': 'GB',
            
            // Full country names
            'UKRAINE': 'UA', 'CANADA': 'CA', 'AUSTRALIA': 'AU',
            'GERMANY': 'DE', 'FRANCE': 'FR', 'SPAIN': 'ES', 'ITALY': 'IT',
            'BRAZIL': 'BR', 'MEXICO': 'MX', 'JAPAN': 'JP', 'CHINA': 'CN',
            'INDIA': 'IN', 'RUSSIA': 'RU', 'INDONESIA': 'ID', 'NETHERLANDS': 'NL',
            'POLAND': 'PL', 'SWEDEN': 'SE', 'NORWAY': 'NO', 'DENMARK': 'DK',
            'FINLAND': 'FI', 'SWITZERLAND': 'CH', 'AUSTRIA': 'AT', 'BELGIUM': 'BE',
            'IRELAND': 'IE', 'PORTUGAL': 'PT', 'ARGENTINA': 'AR', 'CHILE': 'CL',
            'COLOMBIA': 'CO', 'PERU': 'PE', 'PHILIPPINES': 'PH', 'THAILAND': 'TH',
            'MALAYSIA': 'MY', 'SINGAPORE': 'SG', 'VIETNAM': 'VN', 'VIET NAM': 'VN',
            'SOUTH KOREA': 'KR', 'KOREA': 'KR', 'REPUBLIC OF KOREA': 'KR',
            'KOREA, REPUBLIC OF': 'KR', 'KOREA, SOUTH': 'KR', 'KOREA, NORTH': 'KP',
            'NEW ZEALAND': 'NZ', 'SOUTH AFRICA': 'ZA', 'EGYPT': 'EG', 'TURKEY': 'TR',
            'SAUDI ARABIA': 'SA', 'UAE': 'AE', 'UNITED ARAB EMIRATES': 'AE',
            'ISRAEL': 'IL', 'GREECE': 'GR', 'CZECH REPUBLIC': 'CZ', 'CZECHIA': 'CZ',
            'HUNGARY': 'HU', 'ROMANIA': 'RO', 'BULGARIA': 'BG', 'URUGUAY': 'UY',
            'PARAGUAY': 'PY', 'JAMAICA': 'JM', 'PAKISTAN': 'PK',
            'COSTA RICA': 'CR', 'TANZANIA, UNITED REPUBLIC OF': 'TZ', 'TANZANIA': 'TZ',
            'CROATIA': 'HR', 'SERBIA': 'RS', 'SLOVAKIA': 'SK', 'SLOVENIA': 'SI',
            'LATVIA': 'LV', 'LITHUANIA': 'LT', 'ESTONIA': 'EE', 'CYPRUS': 'CY',
            'LUXEMBOURG': 'LU', 'MALTA': 'MT', 'ICELAND': 'IS', 'BOSNIA': 'BA',
            'BOSNIA AND HERZEGOVINA': 'BA', 'MOLDOVA': 'MD', 'ALBANIA': 'AL',
            'MACEDONIA': 'MK', 'NORTH MACEDONIA': 'MK', 'MONTENEGRO': 'ME',
            'BELARUS': 'BY', 'ANDORRA': 'AD', 'MONACO': 'MC', 'SAN MARINO': 'SM',
            'LIECHTENSTEIN': 'LI', 'VATICAN': 'VA', 'FAROE ISLANDS': 'FO',
            'GIBRALTAR': 'GI', 'ISLE OF MAN': 'IM', 'JERSEY': 'JE', 'GUERNSEY': 'GG',
            'KOSOVO': 'XK',
            'TAIWAN': 'TW', 'HONG KONG': 'HK', 'BANGLADESH': 'BD', 'SRI LANKA': 'LK',
            'NEPAL': 'NP', 'CAMBODIA': 'KH', 'LAOS': 'LA', 'MYANMAR': 'MM',
            'KAZAKHSTAN': 'KZ', 'UZBEKISTAN': 'UZ', 'AZERBAIJAN': 'AZ', 'GEORGIA': 'GE',
            'ARMENIA': 'AM', 'KYRGYZSTAN': 'KG', 'TURKMENISTAN': 'TM',
            'MACAO': 'MO', 'MACAU': 'MO', 'MONGOLIA': 'MN', 'BRUNEI': 'BN',
            'TIMOR-LESTE': 'TL', 'EAST TIMOR': 'TL', 'MALDIVES': 'MV', 'BHUTAN': 'BT',
            'AFGHANISTAN': 'AF', 'TAJIKISTAN': 'TJ', 'NORTH KOREA': 'KP',
            'VENEZUELA': 'VE', 'ECUADOR': 'EC', 'BOLIVIA': 'BO',
            'DOMINICAN REPUBLIC': 'DO', 'GUATEMALA': 'GT', 'HONDURAS': 'HN',
            'EL SALVADOR': 'SV', 'NICARAGUA': 'NI', 'PANAMA': 'PA',
            'PUERTO RICO': 'PR', 'TRINIDAD AND TOBAGO': 'TT', 'TRINIDAD and TOBAGO': 'TT',
            'BAHAMAS': 'BS', 'BARBADOS': 'BB', 'CUBA': 'CU', 'HAITI': 'HT',
            'DOMINICA': 'DM', 'GRENADA': 'GD', 'SAINT LUCIA': 'LC',
            'SAINT VINCENT AND THE GRENADINES': 'VC', 'ANTIGUA AND BARBUDA': 'AG',
            'SAINT KITTS AND NEVIS': 'KN', 'ARUBA': 'AW', 'CURACAO': 'CW',
            'CAYMAN ISLANDS': 'KY', 'BERMUDA': 'BM', 'VIRGIN ISLANDS': 'VI',
            'BRITISH VIRGIN ISLANDS': 'VG', 'TURKS AND CAICOS': 'TC',
            'MARTINIQUE': 'MQ', 'GUADELOUPE': 'GP', 'SURINAME': 'SR',
            'GUYANA': 'GY', 'BELIZE': 'BZ',
            'NIGERIA': 'NG', 'KENYA': 'KE', 'MOROCCO': 'MA', 'ALGERIA': 'DZ',
            'TUNISIA': 'TN', 'GHANA': 'GH', 'UGANDA': 'UG', 'ETHIOPIA': 'ET',
            'IVORY COAST': 'CI', "COTE D'IVOIRE": 'CI', 'COTE DIVOIRE': 'CI',
            'CAMEROON': 'CM', 'SENEGAL': 'SN', 'CAPE VERDE': 'CV',
            'ANGOLA': 'AO', 'BENIN': 'BJ', 'BURKINA FASO': 'BF', 'BURUNDI': 'BI',
            'CENTRAL AFRICAN REPUBLIC': 'CF', 'CHAD': 'TD', 'COMOROS': 'KM',
            'CONGO': 'CG', 'DEMOCRATIC REPUBLIC OF THE CONGO': 'CD', 'DJIBOUTI': 'DJ',
            'EQUATORIAL GUINEA': 'GQ', 'ERITREA': 'ER', 'ESWATINI': 'SZ', 'SWAZILAND': 'SZ',
            'GABON': 'GA', 'GAMBIA': 'GM', 'GUINEA': 'GN', 'GUINEA-BISSAU': 'GW',
            'LESOTHO': 'LS', 'LIBERIA': 'LR', 'LIBYA': 'LY', 'MADAGASCAR': 'MG',
            'MALAWI': 'MW', 'MALI': 'ML', 'MAURITANIA': 'MR', 'MAURITIUS': 'MU',
            'MOZAMBIQUE': 'MZ', 'NAMIBIA': 'NA', 'NIGER': 'NE', 'REUNION': 'RE',
            'RWANDA': 'RW', 'SAO TOME AND PRINCIPE': 'ST', 'SIERRA LEONE': 'SL',
            'SOMALIA': 'SO', 'SOUTH SUDAN': 'SS', 'SEYCHELLES': 'SC',
            'TOGO': 'TG', 'ZAMBIA': 'ZM', 'ZIMBABWE': 'ZW', 'BOTSWANA': 'BW',
            'QATAR': 'QA', 'KUWAIT': 'KW', 'OMAN': 'OM', 'BAHRAIN': 'BH',
            'LEBANON': 'LB', 'JORDAN': 'JO', 'IRAQ': 'IQ',
            'SYRIA': 'SY', 'SYRIAN ARAB REPUBLIC': 'SY', 'YEMEN': 'YE',
            'PALESTINE': 'PS', 'IRAN': 'IR',
            'FIJI': 'FJ', 'PAPUA NEW GUINEA': 'PG', 'SAMOA': 'WS', 'TONGA': 'TO',
            'VANUATU': 'VU', 'SOLOMON ISLANDS': 'SB', 'GUAM': 'GU',
            'FRENCH POLYNESIA': 'PF', 'NEW CALEDONIA': 'NC', 'MICRONESIA': 'FM',
            'PALAU': 'PW', 'MARSHALL ISLANDS': 'MH', 'KIRIBATI': 'KI',
            'NAURU': 'NR', 'TUVALU': 'TV',
            'RUSSIAN FEDERATION': 'RU', 'PEOPLES REPUBLIC OF CHINA': 'CN',
            'CHINA, PEOPLES REPUBLIC OF': 'CN', 'HOLLAND': 'NL', 'THE NETHERLANDS': 'NL',
            'EIRE': 'IE', 'REPUBLIC OF IRELAND': 'IE', 'RSA': 'ZA',
            
            // ISO 3-letter codes fallback
            'UKR': 'UA', 'VNM': 'VN', 'IDN': 'ID', 'BRA': 'BR', 'THA': 'TH',
            'DEU': 'DE', 'FRA': 'FR', 'ESP': 'ES', 'ITA': 'IT', 'NLD': 'NL',
            'SGP': 'SG', 'MYS': 'MY', 'PHL': 'PH', 'KOR': 'KR', 'JPN': 'JP',
            'CHN': 'CN', 'IND': 'IN', 'CAN': 'CA', 'AUS': 'AU', 'MEX': 'MX',
            'ARG': 'AR', 'COL': 'CO', 'ZAF': 'ZA', 'EGY': 'EG', 'SAU': 'SA',
            'ARE': 'AE', 'TUR': 'TR', 'PAK': 'PK', 'NGA': 'NG', 'KEN': 'KE',
            'GHA': 'GH', 'MAR': 'MA', 'DZA': 'DZ', 'TUN': 'TN', 'PER': 'PE',
            'CHL': 'CL', 'VEN': 'VE', 'ECU': 'EC', 'DOM': 'DO', 'CUB': 'CU',
            'RUS': 'RU',
            'COUNTRY': 'XX'
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
                SELECT slug, ip_address, os, country, browser FROM clicks WHERE click_id = ? OR id = ? LIMIT 1
            `).bind(clickId, clickId).first();
            
            if (clickInfo) {
                subId = clickInfo.slug || subId; // Use slug from clicks table
                
                // Override OS and Browser for all networks because postback payload usually lacks them
                if (clickInfo.os) finalTrafficType = clickInfo.os;
                if (clickInfo.browser) userAgent = clickInfo.browser;
                
                // Use tracker country for ALL networks since it is always a valid ISO-2 code (Cloudflare cf.country)
                if (clickInfo.country) {
                    const rawClickCountry = clickInfo.country.toUpperCase().trim();
                    // ONLY use if it's already a valid 2-char ISO code — never truncate longer strings like 'UNKNOWN'
                    if (rawClickCountry.length === 2 && rawClickCountry !== 'XX' && rawClickCountry !== 'UN') {
                        finalCountryCode = rawClickCountry;
                    }
                }
                
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
