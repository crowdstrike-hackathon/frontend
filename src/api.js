const BASE = process.env.REACT_APP_API_BASE ?? "http://localhost:8000";

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

async function request(path, { method = "GET", body, auth = true, extraHeaders = {} } = {}) {
  const headers = { "Content-Type": "application/json", ...extraHeaders };
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
  addTicket: (body) => request("/api/tickets", { method: "POST", body }),
  inbound: (body) => request("/inbound", { method: "POST", body, auth: false }),
  previewTicket: (id, fresh = false) => request(`/api/tickets/${encodeURIComponent(id)}/preview${fresh ? "?fresh=true" : ""}`, { method: "POST" }),
  world: () => request("/api/world"),
  createChat: (body) => request("/api/chats", { method: "POST", body }),
  sendMessage: (id, message) => request(`/api/chats/${id}/messages`, { method: "POST", body: { message } }),
  getChat: (id) => request(`/api/chats/${id}`),
  decideHold: (chatId, holdId, decision) => request(`/api/chats/${chatId}/holds/${holdId}`, { method: "POST", body: { decision } }),
  updateChat: (id, body) => request(`/api/chats/${id}`, { method: "PATCH", body }),
  deleteChat: (id) => request(`/api/chats/${id}`, { method: "DELETE" }),
  cancelChat: (id) => request(`/api/chats/${id}/cancel`, { method: "POST" }),
  agentSettings: () => request("/api/settings/agent"),
  saveAgentSettings: (body) => request("/api/settings/agent", { method: "PUT", body }),
  testAgentSettings: (body) => request("/api/settings/agent/test", { method: "POST", body }),
  history: () => request("/api/history"),
  chatStream: (id, after = -1) => new EventSource(`${BASE}/api/chats/${id}/stream?after=${after}&token=${encodeURIComponent(getToken() || "")}`),
};
