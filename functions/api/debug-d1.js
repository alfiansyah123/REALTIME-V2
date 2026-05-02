export async function onRequest(context) {
    const db = context.env.DB;
    const headers = { 'Content-Type': 'application/json' };
    try {
        const { results: teamColumns } = await db.prepare("PRAGMA table_info(team)").all();
        const { results: teamSamples } = await db.prepare("SELECT * FROM team LIMIT 3").all();
        return new Response(JSON.stringify({ teamColumns, teamSamples }), { status: 200, headers });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
}
