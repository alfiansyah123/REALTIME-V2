export async function onRequest(context) {
    const db = context.env.DB;
    const headers = { 'Content-Type': 'application/json' };
    
    try {
        const { results: count } = await db.prepare("SELECT COUNT(*) as total FROM clicks").all();
        const { results: last10 } = await db.prepare("SELECT * FROM clicks ORDER BY id DESC LIMIT 10").all();
        const { results: teamCount } = await db.prepare("SELECT COUNT(*) as total FROM team").all();
        
        return new Response(JSON.stringify({ 
            clicks_total: count[0].total, 
            team_total: teamCount[0].total,
            last_10_clicks: last10 
        }), { status: 200, headers });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
}
