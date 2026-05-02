// Local API Proxy for iMonetizeIt
// Used in development (localhost) to bypass Supabase Edge Functions

const API_CREDENTIALS = [
    { clientId: 232922, apiKey: '0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027' },
];

async function getTokens(credentials) {
    const url = 'https://api.imonetizeit.com/v1/auth/session';
    const tokenPromises = credentials.map(async (cred) => {
        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ client_id: cred.clientId, api_key: cred.apiKey }),
            });
            const data = await resp.json();
            return data.access_token || null;
        } catch (e) {
            console.error('Token fetch error:', e);
            return null;
        }
    });
    return (await Promise.all(tokenPromises)).filter(Boolean);
}

// Reports handler
async function handleReports(body) {
    const startDate = body.startDate || new Date().toISOString().split('T')[0];
    const endDate = body.endDate || new Date().toISOString().split('T')[0];

    const tokens = await getTokens(API_CREDENTIALS);
    if (tokens.length === 0) {
        return { error: 'Failed to authenticate with iMonetizeIt' };
    }

    const baseUrl = `https://api.imonetizeit.com/v1/statistics/sm`
        + `?start_date=${startDate}`
        + `&end_date=${endDate}`
        + `&segments[]=smartlink`
        + `&timezone=%2B00%3A00`
        + `&include_archived=1`
        + `&limit=1000`;

    const allData = [];
    for (const token of tokens) {
        try {
            const resp = await fetch(baseUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const json = await resp.json();
            if (json.data) {
                for (const row of json.data) {
                    allData.push({
                        smartlink: row.smartlink || 'Unknown',
                        smartlink_id: row.smartlink_id || null,
                        network: row.tracker || 'IMONETIZEIT',
                        visits: parseInt(row.visits) || 0,
                        unique: parseInt(row.unique || row.unigue || row.uniques) || 0,
                        clicks: parseInt(row.clicks) || 0,
                        leads: parseInt(row.leads) || 0,
                        payouts: parseFloat(row.payouts) || 0.0,
                    });
                }
            }
        } catch (e) {
            console.error('Stats fetch error:', e);
        }
    }

    // Aggregate by smartlink
    const aggregated = {};
    for (const row of allData) {
        const name = row.smartlink;
        if (!aggregated[name]) {
            aggregated[name] = { ...row };
        } else {
            aggregated[name].visits += row.visits;
            aggregated[name].unique += row.unique;
            aggregated[name].clicks += row.clicks;
            aggregated[name].leads += row.leads;
            aggregated[name].payouts += row.payouts;
        }
    }

    return { data: Object.values(aggregated).sort((a, b) => b.payouts - a.payouts) };
}

// Report Countries handler
async function handleReportCountries(body) {
    const startDate = body.startDate || new Date().toISOString().split('T')[0];
    const endDate = body.endDate || new Date().toISOString().split('T')[0];
    const smartlinkId = body.smartlinkId;

    const tokens = await getTokens(API_CREDENTIALS);
    if (tokens.length === 0) {
        return { error: 'Failed to authenticate with iMonetizeIt' };
    }

    let baseUrl = `https://api.imonetizeit.com/v1/statistics/sm`
        + `?start_date=${startDate}`
        + `&end_date=${endDate}`
        + `&segments[]=country`
        + `&timezone=%2B00%3A00`
        + `&include_archived=1`
        + `&limit=1000`;

    if (smartlinkId) {
        baseUrl += `&sm_id[]=${encodeURIComponent(smartlinkId)}`;
    }

    const countryStats = {};
    for (const token of tokens) {
        try {
            const resp = await fetch(baseUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const json = await resp.json();
            if (json.data) {
                for (const row of json.data) {
                    const countryCode = row.country || 'XX';
                    if (!countryStats[countryCode]) {
                        countryStats[countryCode] = {
                            country: countryCode,
                            visits: 0, unique: 0, clicks: 0,
                            leads: 0, payouts: 0.0
                        };
                    }
                    countryStats[countryCode].visits += parseInt(row.visits) || 0;
                    countryStats[countryCode].unique += parseInt(row.unique || row.unigue || row.uniques) || 0;
                    countryStats[countryCode].clicks += parseInt(row.clicks) || 0;
                    countryStats[countryCode].leads += parseInt(row.leads) || 0;
                    countryStats[countryCode].payouts += parseFloat(row.payouts) || 0.0;
                }
            }
        } catch (e) {
            console.error('Stats fetch error:', e);
        }
    }

    return {
        data: Object.values(countryStats).sort((a, b) => {
            if (b.payouts !== a.payouts) return b.payouts - a.payouts;
            return b.clicks - a.clicks;
        })
    };
}

// Vite plugin for local API routes
export function localApiProxy() {
    return {
        name: 'local-api-proxy',
        configureServer(server) {
            // POST /api/reports
            server.middlewares.use('/api/reports', async (req, res) => {
                // Handle CORS
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.end();
                    return;
                }

                try {
                    const body = await readBody(req);
                    console.log('[Local API] /api/reports called:', body);
                    const result = await handleReports(body);
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = result.error ? 500 : 200;
                    res.end(JSON.stringify(result));
                } catch (e) {
                    console.error('[Local API] Error:', e);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: e.message }));
                }
            });

            // POST /api/report_countries
            server.middlewares.use('/api/report_countries', async (req, res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.end();
                    return;
                }

                try {
                    const body = await readBody(req);
                    console.log('[Local API] /api/report_countries called:', body);
                    const result = await handleReportCountries(body);
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = result.error ? 500 : 200;
                    res.end(JSON.stringify(result));
                } catch (e) {
                    console.error('[Local API] Error:', e);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: e.message }));
                }
            });

            console.log('✅ Local API Proxy active:');
            console.log('   POST /api/reports');
            console.log('   POST /api/report_countries');
        }
    };
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}
