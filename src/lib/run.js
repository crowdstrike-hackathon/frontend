import { ShieldAlert, ShieldCheck, ShieldQuestion, Hand, CircleCheck, CircleAlert } from "lucide-react";

export const EVENT_TYPES = ["start", "thinking", "call", "result", "hold", "hold_resolved", "filter", "note", "error", "done"];

export const MODE_LABEL = { off: "Defense off", keyword: "Keyword filter", riposte: "Riposte" };

export const SOURCE = {
  trusted: { label: "trusted", hint: "This value appears in a trusted source." },
  untrusted: { label: "from the ticket", hint: "This value only appears in untrusted content." },
  requester: { label: "ticket sender", hint: "This is the address the ticket came from." },
  unknown: { label: "no source", hint: "This value does not appear in anything the agent has read. The model wrote it." },
};

export const OUTCOME = {
  compromised: { label: "Compromised", icon: ShieldAlert, tone: "rose" },
  blocked: { label: "Attack blocked", icon: ShieldCheck, tone: "emerald" },
  reviewed: { label: "Held for a person", icon: Hand, tone: "amber" },
  quarantined: { label: "Quarantined", icon: ShieldQuestion, tone: "amber" },
  clean: { label: "Handled cleanly", icon: CircleCheck, tone: "sky" },
  error: { label: "Run failed", icon: CircleAlert, tone: "slate" },
  cancelled: { label: "Stopped", icon: CircleAlert, tone: "slate" },
};

export const TONE = {
  rose: { bar: "border-l-red-700", text: "text-red-700", dot: "bg-red-600" },
  emerald: { bar: "border-l-emerald-700", text: "text-emerald-700", dot: "bg-emerald-600" },
  amber: { bar: "border-l-amber-600", text: "text-amber-700", dot: "bg-amber-500" },
  sky: { bar: "border-l-ink-3", text: "text-ink", dot: "bg-ink-3" },
  slate: { bar: "border-l-line-strong", text: "text-ink-3", dot: "bg-ink-4" },
};

export function newRun(snapshot) {
  return {
    id: snapshot.id,
    mode: snapshot.mode,
    ticket: snapshot.ticket,
    model: snapshot.model,
    status: "queued",
    items: [],
    thinking: true,
    lastSeq: -1,
    outcome: "",
    summary: "",
    incidents: [],
    stats: null,
    effects: null,
    finalReply: "",
  };
}

function patchCall(items, step, patch) {
  let index = -1;
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (items[i].kind === "call" && items[i].step === step) {
      index = i;
      break;
    }
  }
  if (index === -1) return items;
  const next = items.slice();
  next[index] = { ...next[index], ...patch(next[index]) };
  return next;
}

export function applyEvent(run, e) {
  if (e.seq <= run.lastSeq) return run;
  const next = { ...run, lastSeq: e.seq };
  switch (e.type) {
    case "start":
      return { ...next, status: "running", model: e.model || run.model };
    case "thinking":
      return { ...next, thinking: true };
    case "call":
      return {
        ...next,
        thinking: false,
        items: [...run.items, { kind: "call", key: `c${e.seq}`, step: e.step, tool: e.tool, args: e.args, thought: e.thought, decision: e.decision, checked: e.checked }],
      };
    case "result":
      return { ...next, items: patchCall(run.items, e.step, () => ({ result: e })) };
    case "hold":
      return { ...next, status: "waiting", items: patchCall(run.items, e.step, () => ({ hold: { id: e.hold_id, status: "pending" } })) };
    case "hold_resolved":
      return {
        ...next,
        status: "running",
        items: patchCall(run.items, e.step, (item) => ({ hold: { ...item.hold, status: e.approved ? "approved" : "denied" } })),
      };
    case "filter":
      return { ...next, thinking: false, items: [...run.items, { kind: "filter", key: `f${e.seq}`, hits: e.hits }] };
    case "note":
      return { ...next, items: [...run.items, { kind: "note", key: `n${e.seq}`, text: e.text }] };
    case "error":
      return { ...next, thinking: false, items: [...run.items, { kind: "error", key: `e${e.seq}`, text: e.text }] };
    case "done":
      return {
        ...next,
        thinking: false,
        status: e.status,
        outcome: e.outcome,
        summary: e.summary,
        incidents: e.incidents || [],
        stats: e.stats,
        effects: e.effects,
        finalReply: e.final_reply || "",
      };
    default:
      return next;
  }
}

export function fromSnapshot(snapshot) {
  return (snapshot.events || []).reduce(applyEvent, newRun(snapshot));
}

export function isLive(run) {
  return !!run && !["done", "error", "cancelled"].includes(run.status);
}

export function verdictNote(run) {
  const kind = run.ticket?.kind;
  if (run.outcome === "quarantined" && kind === "benign") return "False positive. This was a legitimate request and the customer got no help.";
  if (run.outcome === "quarantined") return "The ticket never reached the agent. A person has to read it.";
  if (run.outcome === "compromised" && run.mode === "keyword") return "The ticket contained none of the phrases the filter looks for, so it went straight through.";
  if (run.outcome === "compromised" && run.mode === "off") return "Nothing checked the agent's tool calls.";
  if (run.outcome === "blocked") return "The agent was allowed to keep working and told the customer what it could not do.";
  if (run.outcome === "clean" && kind === "benign" && run.mode === "riposte") return "A legitimate request went through untouched.";
  return "";
}
