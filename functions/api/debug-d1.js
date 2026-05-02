export async function onRequest(context) {
    const db = context.env.DB;
    const headers = { 'Content-Type': 'application/json' };
    
    try {
        const slug = "VrLYTRP5zBPMTDQE";
        const { results: teamMatch } = await db.prepare("SELECT * FROM team WHERE username = ? OR id = ?").bind(slug, slug).all();
        const { results: allTeam } = await db.prepare("SELECT username, id FROM team LIMIT 5").all();
        
        return new Response(JSON.stringify({ 
            search_slug: slug,
            match_found: teamMatch,
            team_samples: allTeam
        }), { status: 200, headers });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
}
