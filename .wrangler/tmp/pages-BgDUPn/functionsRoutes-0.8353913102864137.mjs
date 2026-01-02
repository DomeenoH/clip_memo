import { onRequestPost as __api_analyze_js_onRequestPost } from "/Volumes/drive/clip_memo/functions/api/analyze.js"
import { onRequestGet as __api_auth_js_onRequestGet } from "/Volumes/drive/clip_memo/functions/api/auth.js"
import { onRequestPost as __api_auth_js_onRequestPost } from "/Volumes/drive/clip_memo/functions/api/auth.js"

export const routes = [
    {
      routePath: "/api/analyze",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_analyze_js_onRequestPost],
    },
  {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_js_onRequestGet],
    },
  {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_js_onRequestPost],
    },
  ]