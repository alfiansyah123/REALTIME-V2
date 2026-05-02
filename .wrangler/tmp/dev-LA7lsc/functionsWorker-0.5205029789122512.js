var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-RLEs0G/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/pages-PjcclC/functionsWorker-0.5205029789122512.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var urls2 = /* @__PURE__ */ new Set();
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
__name2(checkURL2, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL2(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});
async function onRequestPost(context) {
  const db = context.env.DB;
  const body = await context.request.json();
  const { old_password, new_password } = body;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  if (!db) {
    return new Response(JSON.stringify({ error: "Database connection error" }), { status: 500, headers });
  }
  try {
    const user = await db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").bind("admin", old_password).first();
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "Invalid current password" }), { status: 200, headers });
    }
    await db.prepare("UPDATE users SET password = ? WHERE username = ?").bind(new_password, "admin").run();
    return new Response(JSON.stringify({ success: true, message: "Password changed successfully" }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");
__name2(onRequestOptions, "onRequestOptions");
async function onRequest(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const limit = parseInt(url.searchParams.get("limit")) || 200;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (!db) {
    return new Response(JSON.stringify({ error: "Database connection error", data: [] }), { status: 500, headers });
  }
  try {
    const { results } = await db.prepare(`
            SELECT * FROM clicks 
            ORDER BY id DESC 
            LIMIT ?
        `).bind(limit).all();
    return new Response(JSON.stringify({
      success: true,
      data: results || []
    }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      data: []
    }), { status: 500, headers });
  }
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
async function onRequestOptions2() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions2, "onRequestOptions2");
__name2(onRequestOptions2, "onRequestOptions");
async function onRequest2(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const limit = parseInt(url.searchParams.get("limit")) || 100;
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const clickId = url.searchParams.get("clickId");
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  if (!db) {
    return new Response(JSON.stringify({ error: "Database connection error" }), { status: 500, headers });
  }
  try {
    let query = "SELECT * FROM conversions";
    let conditions = [];
    let params = [];
    if (startDate && endDate) {
      conditions.push("created_at BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }
    if (clickId) {
      conditions.push("click_id = ?");
      params.push(clickId);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);
    const { results } = await db.prepare(query).bind(...params).all();
    return new Response(JSON.stringify({ data: results }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
__name(onRequest2, "onRequest2");
__name2(onRequest2, "onRequest");
async function onRequestOptions3() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions3, "onRequestOptions3");
__name2(onRequestOptions3, "onRequestOptions");
async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const targetDate = url.searchParams.get("date");
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  if (!db) {
    return new Response(JSON.stringify({ error: "Database connection error" }), { status: 500, headers });
  }
  try {
    const startOfDay = `${targetDate}T00:00:00.000Z`;
    const endOfDay = `${targetDate}T23:59:59.999Z`;
    const { results } = await db.prepare(`
            SELECT 
                country,
                COUNT(*) as leads
            FROM conversions
            WHERE created_at BETWEEN ? AND ?
            GROUP BY country
            ORDER BY leads DESC
            LIMIT 10
        `).bind(startOfDay, endOfDay).all();
    return new Response(JSON.stringify({ data: results }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
async function onRequestOptions4() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions4, "onRequestOptions4");
__name2(onRequestOptions4, "onRequestOptions");
async function onRequestGet2(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  if (!db) {
    return new Response(JSON.stringify({ error: "Database connection error" }), { status: 500, headers });
  }
  try {
    const clickId = params.click_id || params.clickid || params.cid || params.track || null;
    const payout = parseFloat(params.payout || params.sum || "0.00");
    const trafficType = (params.os || params.traffic || "WEB").toUpperCase().substring(0, 5);
    let subId = params.sub_id || params.subid || params.smartlink || "Unknown";
    const network = (params.network || params.source || (params.track ? "TRAFEE" : "IMONETIZEIT")).toUpperCase();
    const countryCode = (params.country || params.geo || "XX").toUpperCase().substring(0, 2);
    const ip = context.request.headers.get("cf-connecting-ip") || "0.0.0.0";
    const userAgent = context.request.headers.get("user-agent") || "";
    if (!clickId && subId === "Unknown") {
      return new Response(JSON.stringify({ error: "Missing clickid or smartlink" }), { status: 400, headers });
    }
    if (clickId) {
      const clickInfo = await db.prepare(`
                SELECT slug FROM clicks WHERE click_id = ? OR id = ? LIMIT 1
            `).bind(clickId, clickId).first();
      if (clickInfo && clickInfo.slug) {
        subId = clickInfo.slug;
      }
    }
    const finalClickId = clickId || subId || `gen-${crypto.randomUUID()}`;
    await db.prepare(`
            INSERT INTO conversions (click_id, sub_id, network, country, traffic_type, earning, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      finalClickId,
      subId,
      network,
      countryCode,
      trafficType,
      payout,
      ip,
      userAgent
    ).run();
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await db.prepare(`
            INSERT INTO daily_reports (date, smartlink, network, leads, payout)
            VALUES (?, ?, ?, 1, ?)
            ON CONFLICT(date, smartlink, network) DO UPDATE SET
            leads = leads + 1,
            payout = payout + EXCLUDED.payout,
            updated_at = CURRENT_TIMESTAMP
        `).bind(today, subId, network, payout).run();
    return new Response(JSON.stringify({ success: true, message: "Conversion recorded", id: finalClickId }), { status: 200, headers });
  } catch (error) {
    console.error("Postback Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequest3(context) {
  const db = context.env.DB;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (!db) {
    return new Response(JSON.stringify({ success: false, error: "Database connection error" }), { status: 500, headers });
  }
  try {
    const { input_password } = await context.request.json();
    if (!input_password) {
      return new Response(JSON.stringify({ success: false, error: "Password required" }), { status: 400, headers });
    }
    const user = await db.prepare(`
            SELECT * FROM users LIMIT 1
        `).first();
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "No users found" }), { status: 404, headers });
    }
    if (user.password === input_password) {
      return new Response(JSON.stringify({ success: true, message: "Login successful" }), { status: 200, headers });
    } else {
      return new Response(JSON.stringify({ success: false, message: "Invalid password" }), { status: 401, headers });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Server error: " + error.message }), { status: 500, headers });
  }
}
__name(onRequest3, "onRequest3");
__name2(onRequest3, "onRequest");
async function onRequestOptions5() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions5, "onRequestOptions5");
__name2(onRequestOptions5, "onRequestOptions");
async function onRequest4(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const startDate = url.searchParams.get("startDate") || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const endDate = url.searchParams.get("endDate") || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers });
  }
  const API_CREDENTIALS = [
    { clientId: 232922, apiKey: "0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027" }
  ];
  async function getTokens(credentials) {
    const authUrl = "https://api.imonetizeit.com/v1/auth/session";
    const tokenPromises = credentials.map(async (cred) => {
      try {
        const resp = await fetch(authUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ client_id: cred.clientId, api_key: cred.apiKey })
        });
        const data = await resp.json();
        return data.access_token || null;
      } catch (e) {
        return null;
      }
    });
    const results = await Promise.all(tokenPromises);
    return results.filter(Boolean);
  }
  __name(getTokens, "getTokens");
  __name2(getTokens, "getTokens");
  async function getIMonStats(tokens, start, end) {
    const baseUrl = `https://api.imonetizeit.com/v1/statistics/sm?start_date=${start}&end_date=${end}&segments[]=smartlink&timezone=%2B00%3A00&include_archived=1&limit=1000`;
    const statsPromises = tokens.map(async (token) => {
      try {
        const resp = await fetch(baseUrl, { headers: { "Authorization": `Bearer ${token}` } });
        const json = await resp.json();
        return json.data || [];
      } catch (e) {
        return [];
      }
    });
    const results = await Promise.all(statsPromises);
    const aggregated = {};
    for (const dataArray of results) {
      for (const row of dataArray) {
        const name = row.smartlink || "Unknown";
        if (!aggregated[name]) {
          aggregated[name] = {
            smartlink: name,
            slug: name,
            smartlink_id: row.smartlink_id || null,
            network: row.tracker || "IMONETIZEIT",
            visits: 0,
            unique: 0,
            clicks: 0,
            leads: 0,
            payouts: 0
          };
        }
        aggregated[name].visits += parseInt(row.visits) || 0;
        aggregated[name].unique += parseInt(row.unique || row.unigue || row.uniques) || 0;
        aggregated[name].clicks += parseInt(row.clicks) || 0;
        aggregated[name].leads += parseInt(row.leads) || 0;
        aggregated[name].payouts += parseFloat(row.payouts) || 0;
      }
    }
    return aggregated;
  }
  __name(getIMonStats, "getIMonStats");
  __name2(getIMonStats, "getIMonStats");
  try {
    const tokens = await getTokens(API_CREDENTIALS);
    const imonData = await getIMonStats(tokens, startDate, endDate);
    let finalData = Object.values(imonData);
    try {
      const { results: d1Stats } = await db.prepare(`
                SELECT 
                    t.username as smartlink,
                    c.slug,
                    'TRAFEE' as network,
                    COUNT(c.id) as clicks,
                    SUM(CASE WHEN c.is_lead = 1 THEN 1 ELSE 0 END) as leads,
                    SUM(COALESCE(c.payout, 0)) as payouts
                FROM clicks c
                LEFT JOIN team t ON c.slug = t.username
                WHERE DATE(c.created_at) BETWEEN ? AND ?
                GROUP BY c.slug
            `).bind(startDate, endDate).all();
      if (d1Stats && d1Stats.length > 0) {
        d1Stats.forEach((row) => {
          finalData.push({
            ...row,
            visits: row.clicks,
            unique: row.clicks,
            smartlink: row.smartlink || row.slug
          });
        });
      }
    } catch (e) {
      console.error("D1 Fetch Error:", e);
    }
    finalData.sort((a, b) => b.payouts - a.payouts);
    return new Response(JSON.stringify({ data: finalData }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, data: [] }), { status: 500, headers });
  }
}
__name(onRequest4, "onRequest4");
__name2(onRequest4, "onRequest");
async function onRequest5(context) {
  const db = context.env.DB;
  try {
    const { results: links } = await db.prepare("SELECT * FROM links LIMIT 5").all();
    const { results: team } = await db.prepare("SELECT * FROM team LIMIT 5").all();
    const content = JSON.stringify({ links, team }, null, 2);
    return new Response(content, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  } catch (e) {
    return new Response(e.message, { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}
__name(onRequest5, "onRequest5");
__name2(onRequest5, "onRequest");
async function onRequest6(context) {
  const db = context.env.DB;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  if (!db) return new Response(JSON.stringify({ error: "DB not found" }), { status: 500, headers });
  try {
    const body = await context.request.json();
    const {
      slug,
      country,
      ip_address,
      user_agent,
      browser,
      os,
      device,
      click_id,
      referer,
      is_bot
    } = body;
    if (is_bot) return new Response(JSON.stringify({ success: true, skipped: "bot" }), { status: 200, headers });
    await db.prepare(`
            INSERT INTO clicks (
                slug, country, ip_address, user_agent, browser, os, device, click_id, referer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      slug || "-",
      country || "XX",
      ip_address || "0.0.0.0",
      user_agent || "",
      browser || "",
      os || "",
      device || "",
      click_id || null,
      referer || ""
    ).run();
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
__name(onRequest6, "onRequest6");
__name2(onRequest6, "onRequest");
async function onRequest7(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
  if (context.request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const API_CREDENTIALS = [
    { clientId: 232922, apiKey: "0d92f1bfe4bc4aa894825a66db3aa1e8406eaa66cc084fd06c73f47287c20027" }
  ];
  async function getTokens(credentials) {
    const url = "https://api.imonetizeit.com/v1/auth/session";
    const tokenPromises = credentials.map(async (cred) => {
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ client_id: cred.clientId, api_key: cred.apiKey })
        });
        const data = await resp.json();
        return data.access_token || null;
      } catch (e) {
        console.error("Token fetch error:", e);
        return null;
      }
    });
    return (await Promise.all(tokenPromises)).filter(Boolean);
  }
  __name(getTokens, "getTokens");
  __name2(getTokens, "getTokens");
  async function getCountryStats(tokens, startDate, endDate, smartlinkId) {
    let baseUrl = `https://api.imonetizeit.com/v1/statistics/sm?start_date=${startDate}&end_date=${endDate}&segments[]=country&timezone=%2B00%3A00&include_archived=1&limit=1000`;
    if (smartlinkId) {
      baseUrl += `&sm_id[]=${encodeURIComponent(smartlinkId)}`;
    }
    const statsPromises = tokens.map(async (token) => {
      try {
        const resp = await fetch(baseUrl, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await resp.json();
        return json.data || [];
      } catch (e) {
        console.error("Stats fetch error:", e);
        return [];
      }
    });
    const results = await Promise.all(statsPromises);
    const countryStats = {};
    for (const dataArray of results) {
      for (const row of dataArray) {
        const countryCode = row.country || "XX";
        if (!countryStats[countryCode]) {
          countryStats[countryCode] = {
            country: countryCode,
            visits: 0,
            unique: 0,
            clicks: 0,
            leads: 0,
            payouts: 0
          };
        }
        countryStats[countryCode].visits += parseInt(row.visits) || 0;
        countryStats[countryCode].unique += parseInt(row.unique || row.unigue || row.uniques) || 0;
        countryStats[countryCode].clicks += parseInt(row.clicks) || 0;
        countryStats[countryCode].leads += parseInt(row.leads) || 0;
        countryStats[countryCode].payouts += parseFloat(row.payouts) || 0;
      }
    }
    return Object.values(countryStats).sort((a, b) => {
      if (b.payouts !== a.payouts) return b.payouts - a.payouts;
      return b.clicks - a.clicks;
    });
  }
  __name(getCountryStats, "getCountryStats");
  __name2(getCountryStats, "getCountryStats");
  try {
    let startDate, endDate, smartlinkId;
    if (context.request.method === "POST") {
      const body = await context.request.json();
      startDate = body.startDate;
      endDate = body.endDate;
      smartlinkId = body.smartlinkId;
    } else {
      const url = new URL(context.request.url);
      startDate = url.searchParams.get("startDate");
      endDate = url.searchParams.get("endDate");
      smartlinkId = url.searchParams.get("smartlinkId");
    }
    if (!startDate) startDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (!endDate) endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const tokens = await getTokens(API_CREDENTIALS);
    if (tokens.length === 0) throw new Error("Failed to authenticate with iMonetizeIt");
    const data = await getCountryStats(tokens, startDate, endDate, smartlinkId);
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(onRequest7, "onRequest7");
__name2(onRequest7, "onRequest");
async function onRequest8(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const startDate = url.searchParams.get("startDate") || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const endDate = url.searchParams.get("endDate") || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers });
  }
  try {
    const { results: d1Stats } = await db.prepare(`
            SELECT 
                COALESCE(t.name, c.slug) as smartlink,
                c.slug,
                'TRAFEE' as network,
                COUNT(c.id) as clicks,
                SUM(CASE WHEN c.is_lead = 1 THEN 1 ELSE 0 END) as leads,
                SUM(COALESCE(c.payout, 0)) as payouts
            FROM clicks c
            LEFT JOIN team t ON c.slug = t.user_id
            WHERE (c.s3 = 'TRAFEE' OR c.s3 IS NULL)
              AND DATE(c.created_at) BETWEEN ? AND ?
            GROUP BY c.slug
            ORDER BY payouts DESC
        `).bind(startDate, endDate).all();
    const data = d1Stats.map((row) => ({
      ...row,
      visits: 0,
      unique: 0
    }));
    return new Response(JSON.stringify({ data }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, data: [] }), { status: 500, headers });
  }
}
__name(onRequest8, "onRequest8");
__name2(onRequest8, "onRequest");
var routes = [
  {
    routePath: "/api/change-password",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/change-password",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/clicks",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/conversions",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions3]
  },
  {
    routePath: "/api/country-leads",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/country-leads",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions4]
  },
  {
    routePath: "/api/postback",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/verify-password",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions5]
  },
  {
    routePath: "/api/clicks",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/conversions",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/daily-reports",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/debug-d1",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/log-click",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  },
  {
    routePath: "/api/report-countries",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest7]
  },
  {
    routePath: "/api/trafee-reports",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest8]
  },
  {
    routePath: "/api/verify-password",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../Users/LENOVO/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../Users/LENOVO/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-RLEs0G/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../Users/LENOVO/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-RLEs0G/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.5205029789122512.js.map
