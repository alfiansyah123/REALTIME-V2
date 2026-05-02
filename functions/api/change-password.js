export async function onRequestPost(context) {
    const db = context.env.DB;
    const body = await context.request.json();
    const { old_password, new_password } = body;
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!db) {
        return new Response(JSON.stringify({ error: 'Database connection error' }), { status: 500, headers });
    }

    try {
        // 1. Verify old password
        const user = await db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
            .bind('admin', old_password)
            .first();

        if (!user) {
            return new Response(JSON.stringify({ success: false, message: 'Invalid current password' }), { status: 200, headers });
        }

        // 2. Update to new password
        await db.prepare('UPDATE users SET password = ? WHERE username = ?')
            .bind(new_password, 'admin')
            .run();

        return new Response(JSON.stringify({ success: true, message: 'Password changed successfully' }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
