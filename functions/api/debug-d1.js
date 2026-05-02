export async function onRequest(context) {
    const db = context.env.DB;
    const headers = { 'Content-Type': 'application/json' };
    try {
        const { results: linksSample } = await db.prepare("SELECT * FROM links LIMIT 3").all();
        const { results: teamSample } = await db.prepare("SELECT * FROM team LIMIT 3").all();
        return new Response(JSON.stringify({ linksSample, teamSample }), { status: 200, headers });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
}
