import { onRequestOptions as __api_change_password_js_onRequestOptions } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\change-password.js"
import { onRequestPost as __api_change_password_js_onRequestPost } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\change-password.js"
import { onRequestOptions as __api_clicks_js_onRequestOptions } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\clicks.js"
import { onRequestOptions as __api_conversions_js_onRequestOptions } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\conversions.js"
import { onRequestGet as __api_country_leads_js_onRequestGet } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\country-leads.js"
import { onRequestOptions as __api_country_leads_js_onRequestOptions } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\country-leads.js"
import { onRequestGet as __api_fix_data_js_onRequestGet } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\fix-data.js"
import { onRequestGet as __api_postback_js_onRequestGet } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\postback.js"
import { onRequestOptions as __api_verify_password_js_onRequestOptions } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\verify-password.js"
import { onRequest as __api_clicks_js_onRequest } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\clicks.js"
import { onRequest as __api_conversions_js_onRequest } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\conversions.js"
import { onRequest as __api_daily_reports_js_onRequest } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\daily-reports.js"
import { onRequest as __api_log_click_js_onRequest } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\log-click.js"
import { onRequest as __api_report_countries_js_onRequest } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\report-countries.js"
import { onRequest as __api_trafee_reports_js_onRequest } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\trafee-reports.js"
import { onRequest as __api_verify_password_js_onRequest } from "C:\\project\\REALTIME - NGELID TEAM\\functions\\api\\verify-password.js"

export const routes = [
    {
      routePath: "/api/change-password",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_change_password_js_onRequestOptions],
    },
  {
      routePath: "/api/change-password",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_change_password_js_onRequestPost],
    },
  {
      routePath: "/api/clicks",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_clicks_js_onRequestOptions],
    },
  {
      routePath: "/api/conversions",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_conversions_js_onRequestOptions],
    },
  {
      routePath: "/api/country-leads",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_country_leads_js_onRequestGet],
    },
  {
      routePath: "/api/country-leads",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_country_leads_js_onRequestOptions],
    },
  {
      routePath: "/api/fix-data",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_fix_data_js_onRequestGet],
    },
  {
      routePath: "/api/postback",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_postback_js_onRequestGet],
    },
  {
      routePath: "/api/verify-password",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_verify_password_js_onRequestOptions],
    },
  {
      routePath: "/api/clicks",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_clicks_js_onRequest],
    },
  {
      routePath: "/api/conversions",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_conversions_js_onRequest],
    },
  {
      routePath: "/api/daily-reports",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_daily_reports_js_onRequest],
    },
  {
      routePath: "/api/log-click",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_log_click_js_onRequest],
    },
  {
      routePath: "/api/report-countries",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_report_countries_js_onRequest],
    },
  {
      routePath: "/api/trafee-reports",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_trafee_reports_js_onRequest],
    },
  {
      routePath: "/api/verify-password",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_verify_password_js_onRequest],
    },
  ]