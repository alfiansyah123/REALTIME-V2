export async function onRequest(context) {
    const db = context.env.DB;
    try {
        const slug = "VrLYTRP5zBPMTDQE";
        const { results: linkMatch } = await db.prepare("SELECT * FROM links WHERE slug = ?").bind(slug).all();
        const { results: teamMatch } = await db.prepare("SELECT * FROM team WHERE user_id = ? OR name = ?").bind(slug, slug).all();
        return new Response(JSON.stringify({ slug, linkMatch, teamMatch }, null, 2), { 
            status: 200, 
            headers: { 'Content-Type': 'text/plain' } 
        });
    } catch (e) {
        return new Response(e.message, { status: 500, headers: { 'Content-Type': 'text/plain' } });
    }
}
