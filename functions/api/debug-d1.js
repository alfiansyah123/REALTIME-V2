export async function onRequest(context) {
    const db = context.env.DB;
    if (!db) return new Response(JSON.stringify({ error: "DB binding 'DB' not found in context.env" }), { status: 500 });
    
    const headers = { 'Content-Type': 'application/json' };
    try {
        const { results: tables } = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        return new Response(JSON.stringify({ tables }), { status: 200, headers });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers });
    }
}
