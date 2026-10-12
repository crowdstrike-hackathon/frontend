import { ShieldAlert, ShieldCheck, ShieldQuestion, Hand, CircleCheck, CircleAlert } from "lucide-react";

export const EVENT_TYPES = ["turn", "thinking", "call", "result", "hold", "hold_resolved", "filter", "note", "error", "answer_delta", "turn_done"];

export const MODE_LABEL = { off: "No defense", keyword: "Keyword filter", riposte: "Riposte" };

export const SOURCE = {
  trusted: { label: "trusted", hint: "This value appears in a trusted source." },
  untrusted: { label: "from a ticket", hint: "This value only appears in untrusted content." },
  requester: { label: "ticket sender", hint: "This is the address the ticket came from." },
  unknown: { label: "no source", hint: "This value does not appear in anything the agent has read. The model wrote it." },
};

export const OUTCOME = {
  compromised: { label: "Compromised", icon: ShieldAlert, tone: "rose" },
  blocked: { label: "Attack blocked", icon: ShieldCheck, tone: "emerald" },
  reviewed: { label: "Held for a person", icon: Hand, tone: "amber" },
  quarantined: { label: "Quarantined", icon: ShieldQuestion, tone: "amber" },
  clean: { label: "No violations", icon: CircleCheck, tone: "sky" },
  error: { label: "Failed", icon: CircleAlert, tone: "slate" },
  cancelled: { label: "Stopped", icon: CircleAlert, tone: "slate" },
  interrupted: { label: "Interrupted", icon: CircleAlert, tone: "amber" },
};

export const TONE = {
  rose: { alert: "destructive", text: "text-red-700", dot: "bg-red-600" },
  emerald: { alert: "success", text: "text-emerald-700", dot: "bg-emerald-600" },
  amber: { alert: "warning", text: "text-amber-700", dot: "bg-amber-500" },
  sky: { alert: "info", text: "text-ink", dot: "bg-ink-3" },
  slate: { alert: "default", text: "text-ink-3", dot: "bg-ink-4" },
};

export function newChat(snapshot) {
  return {
    id: snapshot.id,
    mode: snapshot.mode,
    model: snapshot.model,
    status: snapshot.status || "running",
    live: snapshot.live !== false,
    turns: [],
    effects: null,
    lastSeq: -1,
  };
}

function patchTurn(chat, index, fn) {
  return { ...chat, turns: chat.turns.map((t) => (t.index === index ? fn(t) : t)) };
}

function patchCall(items, step, patch) {
  let at = -1;
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (items[i].kind === "call" && items[i].step === step) {
      at = i;
      break;
    }
  }
  if (at === -1) return items;
  const next = items.slice();
  next[at] = { ...next[at], ...patch(next[at]) };
  return next;
}

export function applyEvent(chat, e) {
  if (e.type === "answer_delta") return patchTurn(chat, e.turn, (t) => (t.status === "running" ? { ...t, thinking: false, answer: e.text } : t));
  if (e.seq <= chat.lastSeq) return chat;
  const next = { ...chat, lastSeq: e.seq };
  const turn = (fn) => patchTurn(next, e.turn, fn);
  switch (e.type) {
    case "turn":
      return {
        ...next,
        status: "running",
        model: e.model || chat.model,
        turns: [
          ...chat.turns,
          { index: e.turn, message: e.message, refs: e.refs || [], items: [], thinking: true, status: "running", outcome: "", summary: "", answer: "", acted: false, incidents: [] },
        ],
      };
    case "thinking":
      return turn((t) => ({ ...t, thinking: true, answer: "" }));
    case "call":
      return turn((t) => ({
        ...t,
        thinking: false,
        items: [...t.items, { kind: "call", key: `c${e.seq}`, step: e.step, tool: e.tool, args: e.args, thought: e.thought, decision: e.decision, checked: e.checked }],
      }));
    case "result":
      return turn((t) => ({ ...t, items: patchCall(t.items, e.step, () => ({ result: e })) }));
    case "hold":
      return { ...turn((t) => ({ ...t, items: patchCall(t.items, e.step, () => ({ hold: { id: e.hold_id, status: "pending" } })) })), status: "waiting" };
    case "hold_resolved":
      return {
        ...turn((t) => ({ ...t, items: patchCall(t.items, e.step, (item) => ({ hold: { ...item.hold, status: e.approved ? "approved" : "denied", by: e.by || "", expired: !!e.expired } })) })),
        status: "running",
      };
    case "filter":
      return turn((t) => ({ ...t, items: [...t.items, { kind: "filter", key: `f${e.seq}`, hits: e.hits }] }));
    case "note":
      return turn((t) => ({ ...t, items: [...t.items, { kind: "note", key: `n${e.seq}`, text: e.text }] }));
    case "error":
      return turn((t) => ({ ...t, thinking: false, items: [...t.items, { kind: "error", key: `e${e.seq}`, text: e.text }] }));
    case "turn_done":
      return {
        ...turn((t) => ({
          ...t,
          thinking: false,
          status: e.status,
          outcome: e.outcome,
          summary: e.summary,
          answer: e.answer || "",
          acted: !!e.acted,
          incidents: e.incidents || [],
        })),
        status: "idle",
        effects: e.effects,
      };
    default:
      return next;
  }
}

export function fromSnapshot(snapshot) {
  const chat = (snapshot.events || []).reduce(applyEvent, newChat(snapshot));
  return { ...chat, status: snapshot.status === "done" ? "idle" : snapshot.status || chat.status, live: snapshot.live !== false };
}

export function isBusy(chat) {
  return !!chat && chat.status !== "idle";
}

export function verdictNote(turn, mode) {
  if (turn.outcome === "quarantined") return "The ticket never reached the agent, whether or not it was an attack. A person has to read it.";
  if (turn.outcome === "compromised" && mode === "keyword") return "The ticket contained none of the phrases the filter looks for, so it went straight through.";
  if (turn.outcome === "compromised" && mode === "off") return "Nothing checked the agent's tool calls.";
  return "";
}
