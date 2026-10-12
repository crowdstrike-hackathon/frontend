import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ban, Check, CircleAlert, Clock, Hand, Inbox, Loader2, MessageSquare, RotateCcw, Undo2, X } from "lucide-react";
import { api } from "../../api";
import { Button } from "../ui/button";
import SendEmail from "./SendEmail";
import { MODE_LABEL, OUTCOME, TONE } from "../../lib/chat";
import { cn } from "../../lib/utils";

const VERDICT = {
  allowed: { label: "Allowed", icon: Check, className: "text-emerald-700" },
  "asks you": { label: "Asks you first", icon: Hand, className: "text-amber-700" },
  blocked: { label: "Riposte blocks", icon: Ban, className: "text-red-700" },
};

function describe(step) {
  const a = step.args || {};
  switch (step.tool) {
    case "create_login_link":
      return `Create a sign-in link for ${a.customer_id || "a customer"}`;
    case "change_contact_email":
      return `Change the contact email for ${a.customer_id || "a customer"} to ${a.new_email || "a new address"}`;
    case "get_customer":
      return `Look up customer ${a.customer_id || ""}`.trim();
    case "search_kb":
      return `Search the help center for "${a.query || ""}"`;
    case "issue_refund":
      return `Refund $${Number(String(a.amount || 0).replace(/[$,]/g, "")).toLocaleString()} to ${a.customer_id || "a customer"}`;
    case "send_email":
      return `Email ${a.to || "someone"}${a.subject ? `: "${a.subject}"` : ""}`;
    case "reply":
      return "Reply to the sender";
    default:
      return step.tool;
  }
}

function tally(preview) {
  if (!preview) return null;
  const blocked = preview.steps.filter((s) => s.verdict === "blocked").length;
  const asks = preview.steps.filter((s) => s.verdict === "asks you").length;
  if (blocked) return { text: `${blocked} blocked`, className: "text-red-700" };
  if (asks) return { text: `${asks} to approve`, className: "text-amber-700" };
  return { text: "all allowed", className: "text-emerald-700" };
}

function Plan({ preview, loading, error, onRetry }) {
  if (loading) {
    return (
      <p className="flex items-center gap-2 py-3 text-[13px] text-ink-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" /> Working out what Nova would do with this, without doing it
      </p>
    );
  }
  if (error) {
    return (
      <p className="flex items-center gap-2 py-3 text-[13px] text-red-700">
        Could not preview this email. <button onClick={onRetry} className="font-medium underline">Try again</button>
      </p>
    );
  }
  if (!preview) return null;
  if (!preview.steps.length) {
    return <p className="py-3 text-[13px] text-ink-3">Nova would just reply, with no other action.</p>;
  }
  return (
    <ol className="flex flex-col divide-y divide-line">
      {preview.steps.map((step, i) => {
        const v = VERDICT[step.verdict] || VERDICT.allowed;
        const Icon = v.icon;
        return (
          <li key={i} className="flex items-start gap-3 py-2">
            <span className="mt-px w-4 shrink-0 text-right font-mono text-[11.5px] text-ink-4">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] text-ink">{describe(step)}</div>
              {step.verdict !== "allowed" && step.title && <div className={cn("mt-0.5 text-[12px] leading-snug", v.className)}>{step.title}</div>}
            </div>
            <span className={cn("flex shrink-0 items-center gap-1 text-[12px] font-medium", v.className)}>
              <Icon className="h-3.5 w-3.5" /> {v.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const DONE_VERDICT = {
  done: { label: "Done", icon: Check, className: "text-emerald-700" },
  approved: { label: "Approved by you", icon: Check, className: "text-emerald-700" },
  denied: { label: "Denied", icon: X, className: "text-ink-3" },
  blocked: { label: "Blocked by Riposte", icon: Ban, className: "text-red-700" },
  failed: { label: "Failed", icon: CircleAlert, className: "text-ink-3" },
  pending: { label: "Waiting for you", icon: Hand, className: "text-amber-700" },
};

function when(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function stateOf(t) {
  const s = t.status?.state;
  return !s || s === "open" ? "open" : s;
}

function badge(t) {
  const state = stateOf(t);
  if (state === "handling") return { text: "Nova is on it", className: "text-brand" };
  if (state === "dismissed") return { text: "Dismissed", className: "text-ink-4" };
  const meta = OUTCOME[t.status?.outcome];
  if (!meta) return { text: "Handled", className: "text-ink-3" };
  return { text: meta.label, className: TONE[meta.tone].text };
}

function Run({ run, onOpenChat }) {
  const meta = OUTCOME[run.outcome] || null;
  return (
    <div className="rounded-lg border border-line bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3">
        <span className="font-medium text-ink-2">{MODE_LABEL[run.mode] || run.mode}</span>
        <span>{when(run.finished_at)}</span>
        {meta && <span className={cn("font-semibold", TONE[meta.tone].text)}>{meta.label}</span>}
        <button onClick={() => onOpenChat(run.chat_id)} className="ml-auto inline-flex items-center gap-1 font-medium text-brand hover:underline">
          <MessageSquare className="h-3.5 w-3.5" /> Open conversation
        </button>
      </div>
      {run.summary && <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{run.summary}</p>}
      {run.steps?.length > 0 ? (
        <ol className="mt-2 flex flex-col divide-y divide-line border-t border-line">
          {run.steps.map((step, i) => {
            const v = DONE_VERDICT[step.verdict] || DONE_VERDICT.done;
            const Icon = v.icon;
            return (
              <li key={i} className="flex items-start gap-3 py-2">
                <span className="mt-px w-4 shrink-0 text-right font-mono text-[11.5px] text-ink-4">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] text-ink">{describe(step)}</div>
                  {step.title && step.rule !== "outgoing" && step.verdict !== "done" && (
                    <div className={cn("mt-0.5 text-[12px] leading-snug", step.verdict === "blocked" ? "text-red-700" : "text-amber-700")}>{step.title}</div>
                  )}
                </div>
                <span className={cn("flex shrink-0 items-center gap-1 text-[12px] font-medium", v.className)}>
                  <Icon className="h-3.5 w-3.5" /> {v.label}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-2 text-[13px] text-ink-3">Nova took no action beyond reading the email.</p>
      )}
      {run.answer && (
        <p className="mt-2 rounded-md bg-paper-2 px-3 py-2 text-[13px] leading-relaxed text-ink-2">
          <span className="font-medium text-ink">Nova to you: </span>{run.answer}
        </p>
      )}
    </div>
  );
}

function isRisky(step) {
  if (step.verdict === "blocked") return true;
  return !!step.rule && step.rule !== "outgoing" && ["denied", "pending", "approved"].includes(step.verdict);
}

function score(tickets) {
  const runs = tickets.flatMap((t) => t.status?.runs || []);
  const guarded = runs.filter((r) => r.mode === "riposte");
  const tried = guarded.filter((r) => r.outcome === "compromised" || (r.steps || []).some(isRisky));
  const stopped = tried.filter((r) => r.outcome !== "compromised" && (r.steps || []).some((s) => isRisky(s) && s.verdict !== "approved"));
  const leaked = guarded.filter((r) => r.outcome === "compromised");
  const open = runs.filter((r) => r.mode === "off");
  return {
    handled: guarded.length,
    refused: guarded.length - tried.length,
    tried: tried.length,
    stopped: stopped.length,
    leaked: leaked.length,
    openRuns: open.length,
    openLeaked: open.filter((r) => r.outcome === "compromised").length,
  };
}

function Scorecard({ tickets }) {
  const s = score(tickets);
  if (!s.handled && !s.openRuns) return null;
  const cell = (value, label, className = "text-ink") => (
    <div className="min-w-0 flex-1 rounded-md bg-white px-2 py-1.5 ring-1 ring-line">
      <div className={cn("text-[17px] font-semibold leading-none", className)}>{value}</div>
      <div className="mt-1 text-[10.5px] leading-tight text-ink-3">{label}</div>
    </div>
  );
  return (
    <div className="mx-3 mb-2 rounded-lg bg-paper-2 p-2">
      <div className="mb-1.5 text-[11px] font-semibold text-ink-2">With Riposte on, across {s.handled} handled {s.handled === 1 ? "email" : "emails"}</div>
      <div className="flex gap-1.5">
        {cell(s.refused, "Nova did nothing risky")}
        {cell(s.tried, "Nova tried something risky", "text-amber-700")}
        {cell(s.stopped, "Stopped by Riposte", "text-emerald-700")}
        {cell(s.leaked, "Got through", s.leaked ? "text-red-700" : "text-ink-3")}
      </div>
      {s.openRuns > 0 && (
        <div className="mt-1.5 text-[11px] text-ink-3">
          With no defense: {s.openLeaked} of {s.openRuns} {s.openRuns === 1 ? "run" : "runs"} leaked data or paid out money.
        </div>
      )}
    </div>
  );
}

export default function MailView({ tickets, disabled, onHandle, onOpenChat, onChanged, onSent }) {
  const [tab, setTab] = useState("open");
  const [selected, setSelected] = useState(null);
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [busyId, setBusyId] = useState(null);
  const requested = useRef(new Set());

  const open = useMemo(() => {
    const inbound = tickets.filter((t) => t.kind === "inbound" && stateOf(t) === "open").reverse();
    const rest = tickets.filter((t) => t.kind !== "inbound" && stateOf(t) === "open");
    return [...inbound, ...rest];
  }, [tickets]);

  const done = useMemo(
    () => tickets.filter((t) => stateOf(t) !== "open").sort((a, b) => (b.status?.updated_at || "").localeCompare(a.status?.updated_at || "")),
    [tickets]
  );

  const items = tab === "open" ? open : done;
  const current = items.find((t) => t.id === selected) || items[0] || null;

  const load = useCallback((id, fresh = false) => {
    requested.current.add(id);
    setLoading((m) => ({ ...m, [id]: true }));
    setErrors((m) => ({ ...m, [id]: false }));
    api.previewTicket(id, fresh)
      .then((p) => setPreviews((m) => ({ ...m, [id]: p })))
      .catch(() => setErrors((m) => ({ ...m, [id]: true })))
      .finally(() => setLoading((m) => ({ ...m, [id]: false })));
  }, []);

  const currentId = current?.id;
  const currentOpen = current ? stateOf(current) === "open" : false;
  useEffect(() => {
    if (currentId && currentOpen && !requested.current.has(currentId)) load(currentId);
  }, [currentId, currentOpen, load]);

  const act = async (fn, id) => {
    setBusyId(id);
    try {
      await fn(id);
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  };

  const state = current ? stateOf(current) : "open";
  const runs = [...(current?.status?.runs || [])].reverse();

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <div className="flex max-h-[40vh] min-h-0 shrink-0 flex-col border-b border-line md:max-h-none md:w-[340px] md:border-b-0 md:border-r">
        <div className="flex items-center gap-1 px-3 pb-2 pt-3">
          {[["open", "Incoming", open.length], ["done", "Handled", done.length]].map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSelected(null); }}
              className={cn("whitespace-nowrap rounded-md px-2.5 py-1 text-[12.5px] font-semibold transition-colors", tab === id ? "bg-paper-3 text-ink" : "text-ink-3 hover:text-ink")}
            >
              {label} <span className="font-normal text-ink-3">{count}</span>
            </button>
          ))}
          <span className="ml-auto"><SendEmail onSent={onSent} /></span>
        </div>
        <p className="px-4 pb-2 text-[11.5px] leading-snug text-ink-4">
          Work coming in to Nova from Northwind's helpdesk, simulated for this demo. In production this comes from the client's own Gmail, Zendesk or ticketing system.
        </p>
        {tab === "done" && <Scorecard tickets={tickets} />}
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {!items.length && (
            <li className="px-2 py-6 text-[13px] text-ink-3">{tab === "open" ? "Nothing waiting." : "Nothing handled yet."}</li>
          )}
          {items.map((t) => {
            const active = current?.id === t.id;
            const summary = tab === "open" ? tally(previews[t.id]) : badge(t);
            return (
              <li key={t.id}>
                <button
                  onClick={() => setSelected(t.id)}
                  className={cn("flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors", active ? "bg-paper-3" : "hover:bg-paper-2")}
                >
                  <span className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
                    {t.kind === "inbound" && tab === "open" && <span className="rounded bg-brand px-1 py-px text-[9.5px] font-semibold uppercase tracking-wide text-white">New</span>}
                    <span className="min-w-0 flex-1 truncate">{t.from}</span>
                    <span className="shrink-0 font-mono text-[10.5px] text-ink-4">{tab === "done" && t.status?.updated_at ? when(t.status.updated_at) : t.id}</span>
                  </span>
                  <span className="truncate text-[13.5px] font-medium text-ink">{t.title || t.subject}</span>
                  {summary && <span className={cn("text-[11.5px] font-medium", summary.className)}>{summary.text}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {current ? (
          <div className="mx-auto max-w-2xl px-5 py-5">
            <div className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-ink-3">
              <span className="font-mono">{current.id}</span>
              <span>from {current.from}</span>
              <span>{current.customer_id ? `account ${current.customer_id}` : "no account matched"}</span>
              {current.received_at && <span>received {when(current.received_at)}</span>}
            </div>
            <h2 className="mt-1 text-[19px] font-semibold leading-snug text-ink">{current.subject}</h2>
            <p className="mt-2 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-2">{current.body}</p>

            {state === "open" ? (
              <>
                <div className="mt-6 rounded-lg border border-line bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                    What Nova wants to do
                    {previews[current.id] && (
                      <button onClick={() => load(current.id, true)} aria-label="Preview again" className="text-ink-4 hover:text-ink">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <span className="ml-auto text-[11.5px] font-normal text-ink-4">Preview only. Nothing has been sent.</span>
                  </div>
                  <Plan preview={previews[current.id]} loading={loading[current.id]} error={errors[current.id]} onRetry={() => load(current.id, true)} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button disabled={disabled} onClick={() => onHandle(current)}>Hand to Nova</Button>
                  <Button variant="ghost" disabled={busyId === current.id} onClick={() => act(api.dismissTicket, current.id)}><X /> Dismiss</Button>
                </div>
                {runs.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-2 text-[12.5px] font-semibold text-ink">Earlier runs</div>
                    <div className="flex flex-col gap-2">{runs.map((run, i) => <Run key={i} run={run} onOpenChat={onOpenChat} />)}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {state === "handling" && (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Nova is working on this
                    </span>
                  )}
                  {state === "dismissed" && (
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-3"><Clock className="h-3.5 w-3.5" /> Dismissed {when(current.status?.updated_at)}</span>
                  )}
                  {state === "handling" && current.status?.chat_id && (
                    <Button size="sm" variant="outline" onClick={() => onOpenChat(current.status.chat_id)}><MessageSquare /> Open conversation</Button>
                  )}
                  <span className="flex-1" />
                  {state !== "handling" && (
                    <>
                      <Button size="sm" variant="outline" disabled={disabled} onClick={() => onHandle(current)}>Hand to Nova again</Button>
                      <Button size="sm" variant="ghost" disabled={busyId === current.id} onClick={() => act(api.reopenTicket, current.id)}><Undo2 /> Back to inbox</Button>
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-[12.5px] font-semibold text-ink">What Nova did</div>
                  {runs.length ? (
                    <div className="flex flex-col gap-2">{runs.map((run, i) => <Run key={i} run={run} onOpenChat={onOpenChat} />)}</div>
                  ) : (
                    <p className="text-[13px] text-ink-3">{state === "dismissed" ? "Dismissed without handing it to Nova." : "Nothing recorded yet."}</p>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid h-full place-items-center px-6 text-center text-[13.5px] text-ink-3">
            <div>
              <Inbox className="mx-auto mb-2 h-6 w-6 text-ink-4" />
              {tab === "open" ? "Nothing waiting. Send Northwind an email to try one." : "Work Nova has handled, or you dismissed, shows up here."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
