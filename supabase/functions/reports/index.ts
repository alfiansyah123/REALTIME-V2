// Supabase Edge Function: reports
// Proxy untuk iMonetizeIt Statistics API
// Deploy: supabase functions deploy reports
// Atau copy-paste ke Supabase Dashboard > Edge Functions > Create Function

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// iMonetizeIt API Credentials
const API_CREDENTIALS = [
    { clientId: 232922, apiKey: '0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027', network: 'IMONETIZEIT' },
    { clientId: 253423, apiKey: 'fb6a76da0d2f0ae9db4abd239699a5e14520ead232f25e6f4ed936a5da9b8b29', network: 'IMONETIZEIT2' },
]

// 1. Get Auth Token from iMonetizeIt (returns array of {token, network})
async function getTokens(credentials) {
    const url = 'https://api.imonetizeit.com/v1/auth/session'

    const tokenPromises = credentials.map(async (cred) => {
        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ client_id: cred.clientId, api_key: cred.apiKey }),
            })
            const data = await resp.json()
            return data.access_token ? { token: data.access_token, network: cred.network } : null
        } catch (e) {
            console.error('Token fetch error:', e)
            return null
        }
    })

    const tokens = await Promise.all(tokenPromises)
    return tokens.filter(Boolean)
}

// 2. Fetch Statistics from iMonetizeIt (each token carries its network name)
async function getStats(tokenObjs, startDate, endDate) {
    const baseUrl = `https://api.imonetizeit.com/v1/statistics/sm`
        + `?start_date=${startDate}`
        + `&end_date=${endDate}`
        + `&segments[]=smartlink`
        + `&timezone=%2B00%3A00`
        + `&include_archived=1`
        + `&limit=1000`

    const statsPromises = tokenObjs.map(async ({ token, network }) => {
        try {
            const resp = await fetch(baseUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const json = await resp.json()
            return (json.data || []).map(row => ({ ...row, _accountNetwork: network }))
        } catch (e) {
            console.error('Stats fetch error:', e)
            return []
        }
    })

    const results = await Promise.all(statsPromises)
    const allData = []

    for (const dataArray of results) {
        for (const row of dataArray) {
            allData.push({
                smartlink: row.smartlink || 'Unknown',
                smartlink_id: row.smartlink_id || null,
                network: row._accountNetwork || 'IMONETIZEIT',
                visits: parseInt(row.visits) || 0,
                unique: parseInt(row.unique || row.unigue || row.uniques) || 0,
                clicks: parseInt(row.clicks) || 0,
                leads: parseInt(row.leads) || 0,
                payouts: parseFloat(row.payouts) || 0.0,
            })
        }
    }

    return allData
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get date params from request body or URL
        let startDate, endDate

        if (req.method === 'POST') {
            const body = await req.json()
            startDate = body.startDate
            endDate = body.endDate
        } else {
            const url = new URL(req.url)
            startDate = url.searchParams.get('startDate')
            endDate = url.searchParams.get('endDate')
        }

        // Default to today
        if (!startDate) startDate = new Date().toISOString().split('T')[0]
        if (!endDate) endDate = new Date().toISOString().split('T')[0]

        // Fetch tokens and stats
        const tokens = await getTokens(API_CREDENTIALS)

        if (tokens.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Failed to authenticate with iMonetizeIt' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const rawData = await getStats(tokens, startDate, endDate)

        // Aggregate by smartlink name
        const aggregated = {}
        for (const row of rawData) {
            const name = row.smartlink
            if (!aggregated[name]) {
                aggregated[name] = { ...row }
            } else {
                aggregated[name].visits += row.visits
                aggregated[name].unique += row.unique
                aggregated[name].clicks += row.clicks
                aggregated[name].leads += row.leads
                aggregated[name].payouts += row.payouts
            }
        }

        const finalData = Object.values(aggregated).sort((a, b) => b.payouts - a.payouts)

        return new Response(
            JSON.stringify({ data: finalData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Edge function error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
