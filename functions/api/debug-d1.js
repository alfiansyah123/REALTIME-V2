export async function onRequest(context) {
    const db = context.env.DB;
    try {
        const { results: links } = await db.prepare("SELECT * FROM links LIMIT 5").all();
        const { results: team } = await db.prepare("SELECT * FROM team LIMIT 5").all();
        const content = JSON.stringify({ links, team }, null, 2);
        return new Response(content, { 
            status: 200, 
            headers: { 'Content-Type': 'text/plain' } 
        });
    } catch (e) {
        return new Response(e.message, { status: 500, headers: { 'Content-Type': 'text/plain' } });
    }
}
