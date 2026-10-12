import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ban, Check, Hand, Inbox, Loader2, RotateCcw, X } from "lucide-react";
import { api } from "../../api";
import { Button } from "../ui/button";
import SendEmail from "./SendEmail";
import { cn } from "../../lib/utils";

const VERDICT = {
  allowed: { label: "Allowed", icon: Check, className: "text-emerald-700" },
  "asks you": { label: "Asks you first", icon: Hand, className: "text-amber-700" },
  blocked: { label: "Riposte blocks", icon: Ban, className: "text-red-700" },
};

function describe(step) {
  const a = step.args || {};
  switch (step.tool) {
    case "get_api_key":
      return `Fetch the API key for ${a.customer_id || "a customer"}`;
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

export default function MailView({ tickets, hidden, onHide, disabled, onHandle, onSent }) {
  const [selected, setSelected] = useState(null);
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const requested = useRef(new Set());

  const items = useMemo(() => {
    const inbound = tickets.filter((t) => t.kind === "inbound").reverse();
    const rest = tickets.filter((t) => t.kind !== "inbound");
    return [...inbound, ...rest].filter((t) => !hidden.has(t.id));
  }, [tickets, hidden]);

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
  useEffect(() => {
    if (currentId && !requested.current.has(currentId)) load(currentId);
  }, [currentId, load]);

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <div className="flex max-h-[40vh] min-h-0 shrink-0 flex-col border-b border-line md:max-h-none md:w-[340px] md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 pb-2 pt-3">
          <span className="text-[12.5px] font-semibold text-ink">Inbox</span>
          <span className="text-[12px] text-ink-3">{items.length}</span>
          <span className="ml-auto"><SendEmail onSent={onSent} /></span>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {!items.length && <li className="px-2 py-6 text-[13px] text-ink-3">The inbox is empty.</li>}
          {items.map((t) => {
            const active = current?.id === t.id;
            const summary = tally(previews[t.id]);
            return (
              <li key={t.id}>
                <button
                  onClick={() => setSelected(t.id)}
                  className={cn("flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors", active ? "bg-paper-3" : "hover:bg-paper-2")}
                >
                  <span className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
                    {t.kind === "inbound" && <span className="rounded bg-brand px-1 py-px text-[9.5px] font-semibold uppercase tracking-wide text-white">New</span>}
                    <span className="min-w-0 flex-1 truncate">{t.from}</span>
                    <span className="shrink-0 font-mono text-[10.5px] text-ink-4">{t.id}</span>
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
            </div>
            <h2 className="mt-1 text-[19px] font-semibold leading-snug text-ink">{current.subject}</h2>
            <p className="mt-2 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-2">{current.body}</p>

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
              <Button disabled={disabled} onClick={() => { onHide(current.id); onHandle(current); }}>Hand to Nova</Button>
              <Button variant="ghost" onClick={() => onHide(current.id)}><X /> Dismiss</Button>
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center px-6 text-center text-[13.5px] text-ink-3">
            <div>
              <Inbox className="mx-auto mb-2 h-6 w-6 text-ink-4" />
              Nothing waiting. Send Northwind an email to try one.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
