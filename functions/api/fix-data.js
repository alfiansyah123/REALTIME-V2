export async function onRequestGet(context) {
    const db = context.env.DB;
    
    if (!db) {
        return new Response("Database not found", { status: 500 });
    }

    try {
        // 1. Fix 'UN' and 'JA' that are clearly meant to be 'US' (United States)
        // based on the user's report and screenshot
        await db.prepare("UPDATE conversions SET country = 'US' WHERE country = 'UN' OR country = 'JA'").run();

        // 2. Comprehensive mapping for country names
        const mappings = {
            'US': 'United States',
            'ID': 'Indonesia',
            'PK': 'Pakistan',
            'BR': 'Brazil',
            'EG': 'Egypt',
            'LT': 'Lithuania',
            'HU': 'Hungary',
            'PH': 'Philippines',
            'IN': 'India',
            'PA': 'Panama',
            'CO': 'Colombia',
            'RO': 'Romania',
            'GR': 'Greece',
            'IS': 'Iceland',
            'GB': 'United Kingdom',
            'FR': 'France',
            'DE': 'Germany',
            'IT': 'Italy',
            'ES': 'Spain',
            'CA': 'Canada',
            'AU': 'Australia',
            'JP': 'Japan',
            'KR': 'South Korea',
            'CN': 'China',
            'TR': 'Turkey',
            'MY': 'Malaysia',
            'SG': 'Singapore',
            'TH': 'Thailand',
            'VN': 'Vietnam'
        };

        let results = [];
        for (const [code, name] of Object.entries(mappings)) {
            const res = await db.prepare("UPDATE conversions SET country_name = ? WHERE country = ?")
                .bind(name, code)
                .run();
            if (res.meta.changes > 0) {
                results.push(`${code}: ${res.meta.changes} rows updated`);
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Database cleanup completed", 
            details: results 
        }), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (error) {
        return new Response(error.message, { status: 500 });
    }
}
