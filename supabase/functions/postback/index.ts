// Supabase Edge Function: postback
// Handles S2S Postbacks from CPA Networks
// Deploy: supabase functions deploy postback
// Usage: https://<project>.supabase.co/functions/v1/postback?clickid={clickid}&payout={payout}&smartlink={subid}&network={network}&country={geo}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Country Code Mapping (ISO Alpha-3 to Alpha-2 and common typos)
const COUNTRY_MAPPING = {
    'USA': 'US', 'UK': 'GB', 'UN': 'US', 'EN': 'GB', 'GREAT BRITAIN': 'GB',
    'UKR': 'UA', 'UKRAINE': 'UA', 'RUS': 'RU', 'RUSSIA': 'RU',
    'VNM': 'VN', 'VIETNAM': 'VN', 'IDN': 'ID', 'INDONESIA': 'ID',
    'BRA': 'BR', 'BRAZIL': 'BR', 'THA': 'TH', 'THAILAND': 'TH',
    'DEU': 'DE', 'GERMANY': 'DE', 'FRA': 'FR', 'FRANCE': 'FR',
    'ESP': 'ES', 'SPAIN': 'ES', 'ITA': 'IT', 'ITALY': 'IT',
    'NLD': 'NL', 'HOLLAND': 'NL', 'NETHERLANDS': 'NL',
    'SGP': 'SG', 'SINGAPORE': 'SG', 'MYS': 'MY', 'MALAYSIA': 'MY',
    'PHL': 'PH', 'PHILIPPINES': 'PH', 'KOR': 'KR', 'SOUTH KOREA': 'KR',
    'JPN': 'JP', 'JAPAN': 'JP', 'CHN': 'CN', 'CHINA': 'CN',
    'IND': 'IN', 'INDIA': 'IN', 'CAN': 'CA', 'CANADA': 'CA',
    'AUS': 'AU', 'AUSTRALIA': 'AU', 'MEX': 'MX', 'MEXICO': 'MX',
    'ARG': 'AR', 'ARGENTINA': 'AR', 'COL': 'CO', 'COLOMBIA': 'CO',
    'ZAF': 'ZA', 'SOUTH AFRICA': 'ZA', 'EGY': 'EG', 'EGYPT': 'EG',
    'SAU': 'SA', 'SAUDI ARABIA': 'SA', 'ARE': 'AE', 'UAE': 'AE',
    'TUR': 'TR', 'TURKEY': 'TR', 'PAK': 'PK', 'PAKISTAN': 'PK',
    'NGA': 'NG', 'NIGERIA': 'NG', 'KEN': 'KE', 'KENYA': 'KE',
    'GHA': 'GH', 'GHANA': 'GH', 'MAR': 'MA', 'MOROCCO': 'MA',
    'DZA': 'DZ', 'ALGERIA': 'DZ', 'TUN': 'TN', 'TUNISIA': 'TN',
    'PER': 'PE', 'PERU': 'PE', 'CHL': 'CL', 'CHILE': 'CL',
    'VEN': 'VE', 'VENEZUELA': 'VE', 'ECU': 'EC', 'ECUADOR': 'EC',
    'DOM': 'DO', 'DOMINICAN REPUBLIC': 'DO', 'CUB': 'CU', 'CUBA': 'CU',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const params = Object.fromEntries(url.searchParams.entries())

        // 1. Initialize Supabase Client
        // Must use Service Role Key to bypass RLS for inserts/upserts
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 2. Extract & Normalize Parameters
        const clickId = params.click_id || params.clickid || params.cid || null
        const payout = parseFloat(params.payout || params.sum || '0.00')
        const network = params.network || params.source || 'iMonetizeit'
        let subId = params.sub_id || params.subid || params.smartlink || params.click_id || 'Unknown'

        if (!clickId && subId === 'Unknown') {
            return new Response(JSON.stringify({ error: 'Missing clickid' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const finalClickId = clickId || subId

        // 3. LOOKUP ORIGINAL CLICK DATA (CRITICAL FOR ACCURACY)
        // Get original country, os, browser from the initial click
        let countryCode = 'XX'
        let trafficType = 'WEB'
        let userAgent = params.ua || params.user_agent || req.headers.get('user-agent') || ''
        let ip = params.ip || params.user_ip || params.uip || '0.0.0.0'

        const { data: clickData } = await supabase
            .from('clicks')
            .select('country, os, browser, user_agent, ip_address')
            .eq('click_id', finalClickId)
            .single()

        if (clickData) {
            console.log(`Found original click for ${finalClickId}: ${clickData.country}`)
            countryCode = clickData.country || 'XX'
            trafficType = (clickData.os || 'WEB').toUpperCase()
            // Combine OS and Browser for user_agent column in conversions if available
            if (clickData.os && clickData.browser) {
                userAgent = `${clickData.os} | ${clickData.browser}`
            } else if (clickData.user_agent) {
                userAgent = clickData.user_agent
            }
            if (clickData.ip_address) ip = clickData.ip_address
        } else {
            // Fallback to params if click record not found
            console.warn(`No click record found for ${finalClickId}, using params fallback`)
            
            // Normalize Country from Params
            let countryParam = (params.country || params.geo || params.cc || 'XX').toUpperCase()
            countryCode = COUNTRY_MAPPING[countryParam] || (countryParam.length === 2 ? countryParam : 'XX')

            // Normalize Traffic Type
            let rawTraffic = params.os || params.traffic || params.traffic_type || 'WEB'
            trafficType = rawTraffic.toUpperCase().substring(0, 5)

            // GeoIP Fallback (Only if IP is provided and not the Trafee server IP)
            if (countryCode === 'XX' && ip !== '0.0.0.0' && !ip.startsWith('10.') && !ip.startsWith('172.')) {
                try {
                    const geoResp = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`)
                    const geoData = await geoResp.json()
                    if (geoData && geoData.countryCode) {
                        countryCode = geoData.countryCode
                    }
                } catch (e) {
                    console.error('GeoIP lookup failed:', e)
                }
            }
        }

        const countryName = countryCode !== 'XX' ? countryCode : 'Unknown'

        // 4. Insert into 'conversions' table
        const conversionData = {
            click_id: finalClickId,
            sub_id: subId,
            network: network,
            country: countryCode,
            country_name: countryName,
            traffic_type: trafficType,
            earning: payout,
            ip_address: ip,
            user_agent: userAgent,
            created_at: new Date().toISOString()
        }

        const { error: convError } = await supabase
            .from('conversions')
            .insert(conversionData)

        if (convError) {
            throw new Error(`Conversion insert failed: ${convError.message}`)
        }

        // 4. Upsert into 'daily_reports' table
        // Unique key is (date, smartlink, network)
        const today = new Date().toISOString().split('T')[0]

        // Check if row exists first to handle increment logic properly
        // Supabase upsert doesn't support "increment" natively in one atomic query easily without RPC
        // But for simplicity/speed, we fetch-modify-upsert or use RPC.
        // Better approach: Use an RPC for atomic increment.

        // Let's call an RPC for the stats update to be safe and atomic
        const { error: rpcError } = await supabase.rpc('increment_daily_report', {
            report_date: today,
            report_smartlink: subId,
            report_network: network,
            report_payout: payout
        })

        // If RPC doesn't exist yet, we'll need to create it. 
        // Fallback if RPC fails (temporary until user runs migration): Fetch -> Calculate -> Upsert
        if (rpcError) {
            console.warn('RPC increment_daily_report failed, falling back to fetch-upsert', rpcError)

            const { data: existing } = await supabase
                .from('daily_reports')
                .select('*')
                .eq('date', today)
                .eq('smartlink', subId)
                .eq('network', network)
                .single()

            const newStats = {
                date: today,
                smartlink: subId,
                network: network,
                leads: (existing?.leads || 0) + 1,
                clicks: (existing?.clicks || 0), // Postback usually implies a lead/conversion, not just a click? Or both?
                // Logic in PHP was: leads = leads + 1, payout = payout + ?
                visits: (existing?.visits || 0),
                payout: (existing?.payout || 0) + payout
            }

            const { error: upsertError } = await supabase
                .from('daily_reports')
                .upsert(newStats, { onConflict: 'date, smartlink, network' })

            if (upsertError) console.error('Daily report upsert failed:', upsertError)
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Conversion recorded', id: finalClickId }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Postback error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
