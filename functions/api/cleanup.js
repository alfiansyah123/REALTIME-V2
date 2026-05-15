export async function onRequestGet(context) {
    const db = context.env.DB;
    
    if (!db) {
        return new Response(JSON.stringify({ error: 'Database connection error' }), { status: 500 });
    }

    try {
        // 1. HAPUS PERMANEN konversi ghoib (Cuma yang punya banyak separator %2C atau koma)
        const res1 = await db.prepare(`
            DELETE FROM conversions 
            WHERE (sub_id LIKE '%%2C%%2C%%2C%%2C%%' OR sub_id LIKE '%,%,%,%,%')
               OR (click_id LIKE '%%2C%%2C%%2C%%2C%%' OR click_id LIKE '%,%,%,%,%')
        `).run();

        // 2. HAPUS PERMANEN daily_reports sampah
        const res2 = await db.prepare(`
            DELETE FROM daily_reports 
            WHERE smartlink LIKE '%%2C%%2C%%2C%%2C%%' OR smartlink LIKE '%,%,%,%,%'
        `).run();

        // 3. HAPUS PERMANEN clicks sampah
        const res3 = await db.prepare(`
            DELETE FROM clicks 
            WHERE (click_id LIKE '%%2C%%2C%%2C%%2C%%' OR click_id LIKE '%,%,%,%,%')
               OR (user_id LIKE '%%2C%%2C%%2C%%2C%%' OR user_id LIKE '%,%,%,%,%')
        `).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Database cleaned successfully!',
            conversions_fixed: res1.meta.changes,
            reports_fixed: res2.meta.changes,
            clicks_fixed: res3.meta.changes
        }), { 
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            } 
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
