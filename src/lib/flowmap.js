// Builds the information flow map for one turn from its tool calls.
// Left: where information came from. Middle: what the agent did. Right: where it went.

const SOURCES = [
  [/^the operator's message$/, () => ({ id: "operator", label: "Operator", sub: "Your message", kind: "trusted", icon: "operator" })],
  [/^the text of ticket (.+)$/, (m) => ({ id: `ticket:${m[1]}`, label: "Ticket email", sub: `${m[1]} \u00b7 a stranger`, kind: "untrusted", icon: "mail" })],
  [/^the ticket sender$/, () => ({ id: "sender", label: "Ticket sender", sub: "The From address", kind: "requester", icon: "at" })],
  [/^the helpdesk account match$/, () => ({ id: "helpdesk", label: "Helpdesk match", sub: "Account on the ticket", kind: "trusted", icon: "match" })],
  [/^the key vault$/, () => ({ id: "vault", label: "Key vault", sub: "Customers' API keys", kind: "trusted", icon: "key" })],
  [/^the customer record for (.+)$/, (m) => ({ id: `record:${m[1]}`, label: "Customer record", sub: m[1], kind: "trusted", icon: "record" })],
  [/^the help center$/, () => ({ id: "kb", label: "Help center", sub: "Policy articles", kind: "trusted", icon: "book" })],
];

export function sourceFor(origin) {
  for (const [re, make] of SOURCES) {
    const m = origin.match(re);
    if (m) return make(m);
  }
  return { id: origin, label: origin.replace(/^the /, ""), sub: "", kind: "trusted", icon: "record" };
}

function short(text, n = 26) {
  const s = String(text || "");
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function actionSub(item) {
  const a = item.args || {};
  switch (item.tool) {
    case "read_ticket": return `Opened ${a.ticket_id || "the ticket"}`;
    case "search_kb": return `Searched “${short(a.query, 18)}”`;
    case "get_customer": return `Looked up ${a.customer_id || "a customer"}`;
    case "get_api_key": return `Fetched ${a.customer_id || "a"}'s key`;
    case "issue_refund": return `$${a.amount} to ${a.customer_id || "an account"}`;
    case "send_email": return `Email to ${short(a.to, 20)}`;
    case "reply": return "Reply to the sender";
    default: return "";
  }
}

export function actionStatus(item) {
  const action = item.decision?.action || "allow";
  if (action === "block") return "blocked";
  if (action === "hold") {
    const s = item.hold?.status;
    if (s === "approved") return "approved";
    if (s === "denied") return "denied";
    return "held";
  }
  if (item.result && item.result.ok === false) return "failed";
  return "allowed";
}

const STOPPED = new Set(["blocked", "denied"]);
const RANK = { blocked: 5, denied: 4, held: 3, failed: 2, approved: 1, allowed: 0 };

function edgeKind(flow) {
  if (flow.carries === "secret" || flow.carries === "derived") return "secret";
  if (flow.carries === "record") return "record";
  if (flow.trust === "untrusted") return "untrusted";
  return "trusted";
}

function destination(item) {
  if (item.tool === "issue_refund") {
    const id = item.args?.customer_id;
    return id ? { id: `account:${id}`, label: `Account ${id}`, kind: "account" } : null;
  }
  if (!item.to) return null;
  return { id: `to:${item.to}`, label: item.to, kind: item.tool === "reply" ? "reply" : "email" };
}

export function buildFlowGraph(turn) {
  const calls = (turn.items || []).filter((i) => i.kind === "call");
  const sources = new Map();
  const actions = [];
  const outcomes = new Map();
  const edges = [];

  calls.forEach((item, order) => {
    const id = `a:${item.key}`;
    const status = actionStatus(item);
    actions.push({ id, order, tool: item.tool, label: item.tool, sub: actionSub(item), status, decision: item.decision || null, args: item.args || {} });

    if (item.tool === "read_ticket" && item.args?.ticket_id && (!item.result || item.result.ok !== false)) {
      const s = sourceFor(`the text of ticket ${item.args.ticket_id}`);
      if (!sources.has(s.id)) sources.set(s.id, { ...s, order });
    }
    const flows = [...(item.flows || [])];
    if (item.tool === "reply" && item.to) flows.push({ arg: "to", origin: "the ticket sender", trust: "requester", carries: "value" });
    for (const flow of flows) {
      const s = sourceFor(flow.origin);
      if (!sources.has(s.id)) sources.set(s.id, { ...s, order });
      const kind = edgeKind(flow);
      const existing = edges.find((e) => e.from === s.id && e.to === id && e.kind === kind);
      if (existing) existing.args.push(flow.arg);
      else edges.push({ from: s.id, to: id, kind, args: [flow.arg], order });
    }

    const dest = destination(item);
    if (dest) {
      const prev = outcomes.get(dest.id);
      const worst = prev && RANK[prev.status] > RANK[status] ? prev.status : status;
      outcomes.set(dest.id, { ...dest, status: worst, order: prev ? Math.min(prev.order, order) : order, count: (prev?.count || 0) + 1 });
      edges.push({ from: id, to: dest.id, kind: STOPPED.has(status) ? "stopped" : status === "held" ? "held" : "out", args: [], order });
    }
  });

  // Place each source level with the actions it feeds, so lines run across instead of crossing.
  const at = Object.fromEntries(actions.map((a, i) => [a.id, i]));
  const centre = (s) => {
    const fed = edges.filter((e) => e.from === s.id && e.to in at).map((e) => at[e.to]);
    return fed.length ? fed.reduce((x, y) => x + y, 0) / fed.length : Infinity;
  };
  // The sandbox audit is the ground truth for what actually escaped.
  const leaks = (turn.incidents || []).filter((i) => i.kind === "leak");
  for (const o of outcomes.values()) {
    const hit = leaks.find((i) => `to:${i.to}` === o.id);
    if (hit) {
      o.status = "leaked";
      o.leak = hit.summary;
      for (const e of edges) if (e.to === o.id) e.kind = "leak";
    }
  }

  const srcList = [...sources.values()].sort((a, b) => centre(a) - centre(b) || kindRank(a) - kindRank(b) || a.order - b.order);
  // The cause finder's result for the first flagged action that has one.
  const withCause = calls.find((i) => i.cause);
  const cause = withCause ? { ...withCause.cause, actionId: `a:${withCause.key}` } : null;
  const finding = !cause && turn.status === "running" && actions.some((a) => ["blocked", "held"].includes(a.status));

  return { sources: srcList, actions, outcomes: [...outcomes.values()], edges, cause, finding };
}

function kindRank(s) {
  return { trusted: 0, requester: 1, untrusted: 2 }[s.kind] ?? 0;
}

// Everything connected to a node: what fed it (upstream) and what it fed (downstream).
export function traceFrom(graph, id) {
  const up = new Set([id]);
  const down = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of graph.edges) {
      if (up.has(e.to) && !up.has(e.from)) { up.add(e.from); changed = true; }
      if (down.has(e.from) && !down.has(e.to)) { down.add(e.to); changed = true; }
    }
  }
  return new Set([...up, ...down]);
}

const OUTCOME_WORD = { leaked: "leaked", blocked: "never sent", denied: "never sent", held: "waiting for a person", failed: "failed", approved: "sent after approval", allowed: "sent" };

export function describe(graph, id) {
  const node = [...graph.sources, ...graph.actions, ...graph.outcomes].find((n) => n.id === id);
  if (!node) return null;
  if (graph.sources.includes(node)) {
    const fed = graph.edges.filter((e) => e.from === id).map((e) => graph.actions.find((a) => a.id === e.to)).filter(Boolean);
    const stopped = fed.filter((a) => STOPPED.has(a.status) || a.status === "held");
    if (!fed.length) {
      return node.kind === "untrusted"
        ? `${node.label}: the agent read it, but nothing it said ended up deciding an action.`
        : `${node.label}: nothing from it ended up in an action.`;
    }
    const names = [...new Set(fed.map((a) => a.tool))].join(", ");
    let text = `${node.label} fed ${fed.length === 1 ? "1 action" : `${fed.length} actions`}: ${names}.`;
    if (node.kind === "untrusted") text += " It's a stranger's email, so anything it decides is treated as untrusted.";
    if (node.kind === "untrusted" && graph.cause?.stable && graph.cause.guilty.length) text += ` The sentence marked in red below is what made the agent call ${graph.cause.tool}.`;
    if (stopped.length) text += ` Riposte stopped ${stopped.length === fed.length ? (fed.length === 1 ? "it" : "all of them") : `${stopped.length} of them`}.`;
    return text;
  }
  if (graph.actions.includes(node)) {
    const d = node.decision;
    if (d && d.action !== "allow") return `${node.label}: ${d.title}. ${d.reason}`;
    const inputs = graph.edges.filter((e) => e.to === id).map((e) => graph.sources.find((s) => s.id === e.from)?.label).filter(Boolean);
    return `${node.label}: allowed.${inputs.length ? ` Its inputs came from ${[...new Set(inputs)].join(", ")}.` : ""}`;
  }
  if (node.leak) return `${node.label}: leaked. ${node.leak}`;
  const times = node.count > 1 ? ` (${node.count} actions)` : "";
  return `${node.label}${times}: ${OUTCOME_WORD[node.status] || node.status}.`;
}

export function summarize(graph) {
  const untrusted = graph.sources.filter((s) => s.kind === "untrusted").map((s) => s.id);
  const steered = graph.actions.filter((a) => graph.edges.some((e) => e.to === a.id && untrusted.includes(e.from)));
  const stopped = graph.actions.filter((a) => STOPPED.has(a.status)).length;
  const held = graph.actions.filter((a) => a.status === "held").length;
  const leaked = graph.outcomes.filter((o) => o.status === "leaked").length;
  const parts = [`${graph.actions.length} ${graph.actions.length === 1 ? "action" : "actions"}`];
  if (untrusted.length) parts.push(`${steered.length} steered by the ticket email`);
  if (stopped) parts.push(`${stopped} stopped`);
  if (held) parts.push(`${held} waiting for a person`);
  if (leaked) parts.push(`${leaked === 1 ? "1 destination" : `${leaked} destinations`} got data it shouldn't have`);
  return `${parts.join(", ")}. Click any box to trace it.`;
}
