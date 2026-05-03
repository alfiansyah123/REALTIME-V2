export async function onRequestGet(context) {
    const db = context.env.DB;
    
    if (!db) {
        return new Response("Database not found", { status: 500 });
    }

    try {
        const countryMap = {
            'USA': 'US', 'UK': 'GB', 'UN': 'US', 'EN': 'GB', 'GREAT BRITAIN': 'GB', 'UNITED STATES': 'US',
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

        const reverseMap = {};
        for (const [key, val] of Object.entries(countryMap)) {
            // Priority: longer names for country_name
            if (!reverseMap[val] || key.length > reverseMap[val].length) {
                reverseMap[val] = key;
            }
        }

        let totalUpdated = 0;
        let details = [];

        // 1. Fix country codes based on full country_name
        for (const [fullName, code] of Object.entries(countryMap)) {
            const res = await db.prepare("UPDATE conversions SET country = ? WHERE country_name = ? OR country = ?")
                .bind(code, fullName, fullName)
                .run();
            if (res.meta.changes > 0) {
                totalUpdated += res.meta.changes;
                details.push(`Mapping ${fullName} to ${code}: ${res.meta.changes} rows`);
            }
        }

        // 2. Fix country_name based on country code
        for (const [code, name] of Object.entries(reverseMap)) {
            const res = await db.prepare("UPDATE conversions SET country_name = ? WHERE country = ?")
                .bind(name, code)
                .run();
            if (res.meta.changes > 0) {
                totalUpdated += res.meta.changes;
                details.push(`Updated names for ${code} to ${name}: ${res.meta.changes} rows`);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            totalUpdated,
            details
        }), { headers: { "Content-Type": "application/json" } });

    } catch (error) {
        return new Response(error.message, { status: 500 });
    }
}
