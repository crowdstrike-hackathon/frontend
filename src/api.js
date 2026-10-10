const BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const TOKEN_KEY = "sentinel_token";

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
};
