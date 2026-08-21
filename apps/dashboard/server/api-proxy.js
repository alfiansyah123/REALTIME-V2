// Local API Proxy for iMonetizeIt
// Used in development (localhost) to bypass Supabase Edge Functions

const API_CREDENTIALS = [
    { clientId: 232922, apiKey: '0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027', network: 'IMONETIZEIT' },
    { clientId: 253423, apiKey: 'fb6a76da0d2f0ae9db4abd239699a5e14520ead232f25e6f4ed936a5da9b8b29', network: 'IMONETIZEIT2' },
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
            return data.access_token ? { token: data.access_token, network: cred.network } : null;
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

    const tokenObjs = await getTokens(API_CREDENTIALS);
    if (tokenObjs.length === 0) {
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
    for (const { token, network } of tokenObjs) {
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
                        network: network,
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

    // Aggregate by smartlink + network (keep accounts separate)
    const aggregated = {};
    for (const row of allData) {
        const key = `${row.smartlink}__${row.network}`;
        if (!aggregated[key]) {
            aggregated[key] = { ...row };
        } else {
            aggregated[key].visits += row.visits;
            aggregated[key].unique += row.unique;
            aggregated[key].clicks += row.clicks;
            aggregated[key].leads += row.leads;
            aggregated[key].payouts += row.payouts;
        }
    }

    return { data: Object.values(aggregated).sort((a, b) => b.payouts - a.payouts) };
}

// Report Countries handler
async function handleReportCountries(body) {
    const startDate = body.startDate || new Date().toISOString().split('T')[0];
    const endDate = body.endDate || new Date().toISOString().split('T')[0];
    const smartlinkId = body.smartlinkId;

    let tokenObjs = await getTokens(API_CREDENTIALS);
    if (body.network && body.network.toUpperCase() !== 'TRAFEE') {
        tokenObjs = tokenObjs.filter(t => t.network === body.network);
    }
    
    if (tokenObjs.length === 0) {
        return { error: 'Failed to authenticate with iMonetizeIt or network not found' };
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
    for (const { token, network } of tokenObjs) {
        try {
            console.log(`[Local API Debug] Fetching country stats using token for ${network}`);
            const resp = await fetch(baseUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const json = await resp.json();
            if (json.data) {
                console.log(`[Local API Debug] Received ${json.data.length} country rows for network ${network}`);
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
            } else {
                console.log(`[Local API Debug] API Error or no data for ${network}:`, json);
            }
        } catch (e) {
            console.error('Stats fetch error:', e);
        }
    }
    console.log(`[Local API Debug] Final aggregated country stats length: ${Object.keys(countryStats).length}`);

    return {
        data: Object.values(countryStats).sort((a, b) => {
            if (b.payouts !== a.payouts) return b.payouts - a.payouts;
            return b.clicks - a.clicks;
        })
    };
}

// Vite plugin for local API routes
// Vite plugin for local API routes
export function localApiProxy() {
    return {
        name: 'local-api-proxy',
        configureServer(server) {
            // POST /api/verify-password
            server.middlewares.use('/api/verify-password', async (req, res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.end();
                    return;
                }

                console.log('[Local API] /api/verify-password called (auto-approving for development)');
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: 'Welcome to local dev dashboard' }));
            });

            // POST/GET /api/daily-reports
            server.middlewares.use('/api/daily-reports', async (req, res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.end();
                    return;
                }

                try {
                    let body = {};
                    if (req.method === 'POST') {
                        body = await readBody(req);
                    } else if (req.method === 'GET') {
                        const url = new URL(req.url, `http://${req.headers.host}`);
                        body = {
                            startDate: url.searchParams.get('startDate'),
                            endDate: url.searchParams.get('endDate'),
                            network: url.searchParams.get('network')
                        };
                    }
                    console.log('[Local API] /api/daily-reports called:', body);
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

            // GET /api/trafee-reports
            server.middlewares.use('/api/trafee-reports', async (req, res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.end();
                    return;
                }

                console.log('[Local API] /api/trafee-reports called (returning mock Trafee data)');
                const mockData = [
                    { smartlink: 'NGANCAS', user_id: 'NGANCAS', smartlink_id: 'NGANCAS', network: 'TRAFEE', visits: 506, unique: 480, clicks: 506, leads: 7, payouts: 9.38 },
                    { smartlink: 'DRACIN', user_id: 'DRACIN', smartlink_id: 'DRACIN', network: 'TRAFEE', visits: 10, unique: 8, clicks: 10, leads: 3, payouts: 4.50 },
                    { smartlink: 'TOSERBA', user_id: 'TOSERBA', smartlink_id: 'TOSERBA', network: 'TRAFEE', visits: 25, unique: 20, clicks: 25, leads: 10, payouts: 15.00 },
                    { smartlink: 'RAFFA', user_id: 'RAFFA', smartlink_id: 'RAFFA', network: 'TRAFEE', visits: 126, unique: 110, clicks: 126, leads: 1, payouts: 1.35 }
                ];

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ data: mockData }));
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

            // POST /api/report-countries
            server.middlewares.use('/api/report-countries', async (req, res) => {
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
                    const { smartlinkId, network } = body;
                    console.log(`[Local API] /api/report-countries called: smartlink=${smartlinkId}, network=${network}`);

                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;

                    if (String(network).toUpperCase() === 'TRAFEE') {
                        let countryData = [];
                        if (smartlinkId === 'DRACIN') {
                            countryData = [
                                { country: 'ID', visits: 6, unique: 5, clicks: 6, leads: 2, payouts: 3.00 },
                                { country: 'US', visits: 4, unique: 3, clicks: 4, leads: 1, payouts: 1.50 }
                            ];
                        } else if (smartlinkId === 'TOSERBA') {
                            countryData = [
                                { country: 'US', visits: 15, unique: 12, clicks: 15, leads: 6, payouts: 9.00 },
                                { country: 'GB', visits: 10, unique: 8, clicks: 10, leads: 4, payouts: 6.00 }
                            ];
                        } else if (smartlinkId === 'NGANCAS') {
                            countryData = [
                                { country: 'ID', visits: 300, unique: 280, clicks: 300, leads: 4, payouts: 5.38 },
                                { country: 'MY', visits: 206, unique: 200, clicks: 206, leads: 3, payouts: 4.00 }
                            ];
                        } else {
                            countryData = [
                                { country: 'US', visits: 70, unique: 60, clicks: 70, leads: 1, payouts: 1.35 },
                                { country: 'ID', visits: 56, unique: 50, clicks: 56, leads: 0, payouts: 0.00 }
                            ];
                        }
                        res.end(JSON.stringify({ data: countryData }));
                    } else {
                        const result = await handleReportCountries(body);
                        res.end(JSON.stringify(result));
                    }
                } catch (e) {
                    console.error('[Local API] Error:', e);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: e.message }));
                }
            });

            console.log('✅ Local API Proxy active:');
            console.log('   POST /api/reports');
            console.log('   GET  /api/trafee-reports (mock)');
            console.log('   POST /api/report_countries');
            console.log('   POST /api/report-countries (with Trafee mock)');
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
