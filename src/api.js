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
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error(`Cannot reach the Riposte API at ${BASE}`);
  }
  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const data = await res.json();
      detail = typeof data.detail === "string" ? data.detail : data.detail?.[0]?.msg || detail;
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
  tickets: () => request("/api/tickets"),
  world: () => request("/api/world"),
  createRun: (body) => request("/api/runs", { method: "POST", body }),
  getRun: (id) => request(`/api/runs/${id}`),
  decideHold: (runId, holdId, decision) => request(`/api/runs/${runId}/holds/${holdId}`, { method: "POST", body: { decision } }),
  cancelRun: (id) => request(`/api/runs/${id}/cancel`, { method: "POST" }),
  history: () => request("/api/history"),
  runStream: (id) => new EventSource(`${BASE}/api/runs/${id}/stream?token=${encodeURIComponent(getToken() || "")}`),
};
