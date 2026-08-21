// Supabase Edge Function: report_countries
// Fetches country-specific statistics for a smartlink from iMonetizeIt
// Deploy: supabase functions deploy report_countries

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const API_CREDENTIALS = [
    { clientId: 232922, apiKey: '0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027', network: 'IMONETIZEIT' },
    { clientId: 253423, apiKey: 'fb6a76da0d2f0ae9db4abd239699a5e14520ead232f25e6f4ed936a5da9b8b29', network: 'IMONETIZEIT2' },
]

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
    return (await Promise.all(tokenPromises)).filter(Boolean)
}

async function getCountryStats(tokenObjs, startDate, endDate, smartlinkId) {
    // Build URL with country segment and smartlink ID filter
    let baseUrl = `https://api.imonetizeit.com/v1/statistics/sm`
        + `?start_date=${startDate}`
        + `&end_date=${endDate}`
        + `&segments[]=country`
        + `&timezone=%2B00%3A00`
        + `&include_archived=1`
        + `&limit=1000`

    if (smartlinkId) {
        baseUrl += `&sm_id[]=${encodeURIComponent(smartlinkId)}`
    }

    const statsPromises = tokenObjs.map(async ({ token }) => {
        try {
            const resp = await fetch(baseUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const json = await resp.json()
            return json.data || []
        } catch (e) {
            console.error('Stats fetch error:', e)
            return []
        }
    })

    const results = await Promise.all(statsPromises)
    const allData = []

    // Aggregate results from potentially multiple accounts (though we only have 1 now)
    const countryStats = {}

    for (const dataArray of results) {
        for (const row of dataArray) {
            const countryCode = row.country || 'XX'

            if (!countryStats[countryCode]) {
                countryStats[countryCode] = {
                    country: countryCode,
                    visits: 0, unique: 0, clicks: 0,
                    leads: 0, payouts: 0.0
                }
            }

            countryStats[countryCode].visits += parseInt(row.visits) || 0
            countryStats[countryCode].unique += parseInt(row.unique || row.unigue || row.uniques) || 0
            countryStats[countryCode].clicks += parseInt(row.clicks) || 0
            countryStats[countryCode].leads += parseInt(row.leads) || 0
            countryStats[countryCode].payouts += parseFloat(row.payouts) || 0.0
        }
    }

    // Sort by Payouts desc, then Clicks desc
    return Object.values(countryStats).sort((a, b) => {
        if (b.payouts !== a.payouts) return b.payouts - a.payouts
        return b.clicks - a.clicks
    })
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        let startDate, endDate, smartlinkId, smartlinkName, network

        if (req.method === 'POST') {
            const body = await req.json()
            startDate = body.startDate
            endDate = body.endDate
            smartlinkId = body.smartlinkId
            smartlinkName = body.smartlinkName // Optional, fallback/meta
            network = body.network
        } else {
            const url = new URL(req.url)
            startDate = url.searchParams.get('startDate')
            endDate = url.searchParams.get('endDate')
            smartlinkId = url.searchParams.get('smartlinkId')
            network = url.searchParams.get('network')
        }

        if (!startDate) startDate = new Date().toISOString().split('T')[0]
        if (!endDate) endDate = new Date().toISOString().split('T')[0]

        // If no smartlinkId is provided, we can't filter correctly for this view.
        // --- IMONETIZEIT API LOGIC ---
        let tokens = await getTokens(API_CREDENTIALS)
        if (network && network.toUpperCase() !== 'TRAFEE') {
            tokens = tokens.filter(t => t.network === network);
        }
        if (tokens.length === 0) throw new Error('Failed to authenticate with iMonetizeIt or network not found')

        const data = await getCountryStats(tokens, startDate, endDate, smartlinkId)

        return new Response(JSON.stringify({ data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
