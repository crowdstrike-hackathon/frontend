const BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const TOKEN_KEY = "riposte_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      detail = (await res.json()).detail || detail;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  base: BASE,
  register: (data) => request("/api/auth/register", { method: "POST", body: data, auth: false }),
  login: (data) => request("/api/auth/login", { method: "POST", body: data, auth: false }),
  me: () => request("/api/auth/me"),
  meta: () => request("/api/meta", { auth: false }),
  createSession: (scenario_id, opts = {}) =>
    request("/api/sessions", { method: "POST", body: { scenario_id, ...opts } }),
  getSession: (id) => request(`/api/sessions/${id}`),
  step: (id) => request(`/api/sessions/${id}/step`, { method: "POST" }),
  run: (id) => request(`/api/sessions/${id}/run`, { method: "POST" }),
  decide: (id, actionId, decision) =>
    request(`/api/sessions/${id}/actions/${actionId}/${decision}`, { method: "POST" }),
  history: () => request("/api/history"),
  stats: () => request("/api/stats"),
  ingest: (logs) => request("/api/ingest", { method: "POST", body: { logs } }),
  stream: (id) => new EventSource(`${BASE}/api/sessions/${id}/stream?token=${encodeURIComponent(getToken() || "")}`),

  agentTickets: () => request("/api/agent/tickets"),
  createAgentRun: (body) => request("/api/agent/runs", { method: "POST", body }),
  startAgentRun: (id) => request(`/api/agent/runs/${id}/start`, { method: "POST" }),
  getAgentRun: (id) => request(`/api/agent/runs/${id}`),
  agentStream: (id) => new EventSource(`${BASE}/api/agent/runs/${id}/stream?token=${encodeURIComponent(getToken() || "")}`),
  agentHistory: () => request("/api/agent/history"),

  createRedteam: (n = 0) => request("/api/agent/redteam", { method: "POST", body: { n } }),
  startRedteam: (id) => request(`/api/agent/redteam/${id}/start`, { method: "POST" }),
  redteamStream: (id) => new EventSource(`${BASE}/api/agent/redteam/${id}/stream?token=${encodeURIComponent(getToken() || "")}`),

  getConnection: () => request("/api/settings/connection"),
  putConnection: (body) => request("/api/settings/connection", { method: "PUT", body }),
  testConnection: (body) => request("/api/settings/connection/test", { method: "POST", body }),

  scanCode: (body = { use_sample: true }) => request("/api/agent/scan", { method: "POST", body }),
  consoleState: () => request("/api/console/state"),
  consoleMessage: (text) => request("/api/console/message", { method: "POST", body: { text } }),
  consoleStream: () => new EventSource(`${BASE}/api/console/stream?token=${encodeURIComponent(getToken() || "")}`),
};
