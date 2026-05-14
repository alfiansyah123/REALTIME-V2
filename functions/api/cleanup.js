export async function onRequestGet(context) {
    const db = context.env.DB;
    
    if (!db) {
        return new Response(JSON.stringify({ error: 'Database connection error' }), { status: 500 });
    }

    try {
        // 1. Bersihkan tabel conversions dari sub_id sampah (list negara)
        const res1 = await db.prepare(`
            UPDATE conversions 
            SET sub_id = 'Unknown' 
            WHERE sub_id LIKE '%,%' 
               OR sub_id LIKE '%2C%' 
               OR length(sub_id) > 50
        `).run();

        // 2. Bersihkan tabel daily_reports dari smartlink sampah
        const res2 = await db.prepare(`
            UPDATE daily_reports 
            SET smartlink = 'Unknown' 
            WHERE smartlink LIKE '%,%' 
               OR smartlink LIKE '%2C%' 
               OR length(smartlink) > 50
        `).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Database cleaned successfully!',
            conversions_fixed: res1.meta.changes,
            reports_fixed: res2.meta.changes
        }), { 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
