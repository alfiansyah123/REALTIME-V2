export async function onRequest(context) {
    const db = context.env.DB;
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (!db) {
        return new Response(JSON.stringify({ success: false, error: 'Database connection error' }), { status: 500, headers });
    }

    try {
        const { input_password } = await context.request.json();

        if (!input_password) {
            return new Response(JSON.stringify({ success: false, error: 'Password required' }), { status: 400, headers });
        }

        // Simple check against the first user (admin)
        const user = await db.prepare(`
            SELECT * FROM users LIMIT 1
        `).first();

        if (!user) {
            return new Response(JSON.stringify({ success: false, message: 'No users found' }), { status: 404, headers });
        }

        if (user.password === input_password) {
            return new Response(JSON.stringify({ success: true, message: 'Login successful' }), { status: 200, headers });
        } else {
            return new Response(JSON.stringify({ success: false, message: 'Invalid password' }), { status: 401, headers });
        }

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Server error: ' + error.message }), { status: 500, headers });
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
