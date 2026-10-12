import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Filter, PanelRight, ShieldCheck, ShieldOff } from "lucide-react";
import { api } from "../api";
import AppShell from "../components/AppShell";
import Composer from "../components/chat/Composer";
import Inbox from "../components/chat/Inbox";
import SidePanel from "../components/chat/SidePanel";
import RunThread from "../components/chat/Thread";
import { ScrollArea } from "../components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { EVENT_TYPES, applyEvent, fromSnapshot, isLive, newRun } from "../lib/run";
import { cn } from "../lib/utils";

const MODE_KEY = "riposte_mode";
const MODES = [
  { id: "off", label: "Off", icon: ShieldOff },
  { id: "keyword", label: "Keyword filter", icon: Filter },
  { id: "riposte", label: "Riposte", icon: ShieldCheck },
];
function savedMode() {
  try {
    const value = localStorage.getItem(MODE_KEY);
    return MODES.some((m) => m.id === value) ? value : "riposte";
  } catch {
    return "riposte";
  }
}

function ModelStatus({ agent }) {
  if (!agent) return null;
  const ok = agent.reachable && agent.available;
  const hint = ok
    ? `The agent runs on ${agent.model} at ${agent.base_url}.`
    : agent.reachable
    ? `Ollama is up but ${agent.model} is not pulled.`
    : `Nothing is answering at ${agent.base_url}.`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="hidden cursor-help items-center gap-1.5 font-mono text-[11.5px] text-ink-3 sm:flex">
          <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-600" : "bg-red-600")} />
          {ok ? agent.model : "model offline"}
        </span>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}

function EmptyState({ tickets, disabled, onPick }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-[14vh]">
      <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-ink">Send Nova a ticket</h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-3">
        Nova is a support agent with real tools. It reads customer records, fetches API keys, issues refunds and sends email. Run a ticket, then switch the defense and run it again.
      </p>
      <ul className="mt-7 divide-y divide-line border-y border-line">
        {tickets.slice(0, 5).map((t) => (
          <li key={t.id}>
            <button disabled={disabled} onClick={() => onPick(t)} className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-paper-3 disabled:opacity-50">
              <span className="w-16 shrink-0 font-mono text-[11.5px] text-ink-4">{t.id}</span>
              <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{t.title || t.subject}</span>
              <span className="hidden truncate text-[12.5px] text-ink-3 sm:block">{t.from}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Console() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [file, setFile] = useState(null);
  const [world, setWorld] = useState(null);
  const [mode, setModeState] = useState(savedMode);
  const [runs, setRuns] = useState([]);
  const [starting, setStarting] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [panel, setPanel] = useState(true);
  const streams = useRef({});
  const viewport = useRef(null);

  const active = runs[runs.length - 1];
  const busy = starting || isLive(active);
  const modeInfo = meta?.modes?.find((m) => m.id === mode);

  const setMode = (value) => {
    if (!value) return;
    setModeState(value);
    try {
      localStorage.setItem(MODE_KEY, value);
    } catch {}
  };

  const loadTickets = useCallback(() => {
    api.tickets().then((d) => {
      setTickets(d.tickets);
      setFile(d.file);
    }).catch((e) => toast.error(e.message));
  }, []);

  useEffect(() => {
    api.meta().then(setMeta).catch((e) => toast.error(e.message));
    api.world().then(setWorld).catch(() => {});
    loadTickets();
  }, [loadTickets]);

  const update = useCallback((id, fn) => setRuns((prev) => prev.map((r) => (r.id === id ? fn(r) : r))), []);

  const listen = useCallback((id) => {
    streams.current[id]?.close();
    const es = api.runStream(id);
    streams.current[id] = es;
    const close = () => {
      es.close();
      if (streams.current[id] === es) delete streams.current[id];
    };
    EVENT_TYPES.forEach((type) =>
      es.addEventListener(type, (e) => {
        const event = JSON.parse(e.data);
        update(id, (r) => applyEvent(r, event));
        if (type === "done") close();
      })
    );
    es.onerror = () => {
      close();
      api.getRun(id)
        .then((snapshot) => {
          const next = fromSnapshot(snapshot);
          update(id, () => next);
          if (isLive(next)) setTimeout(() => listen(id), 1500);
        })
        .catch(() => {
          update(id, (r) => ({ ...r, status: "error", thinking: false, outcome: "error", summary: "Lost the connection to the Riposte API." }));
        });
    };
  }, [update]);

  useEffect(() => {
    const open = streams.current;
    return () => Object.values(open).forEach((es) => es.close());
  }, []);

  useEffect(() => {
    const id = params.get("run");
    if (!id) return;
    api.getRun(id)
      .then((snapshot) => {
        const run = fromSnapshot(snapshot);
        setRuns([run]);
        if (isLive(run)) listen(id);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setParams({}, { replace: true }));
  }, [params, setParams, listen]);

  useEffect(() => {
    const el = viewport.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [runs]);

  const start = useCallback(async (body) => {
    setStarting(true);
    try {
      const snapshot = await api.createRun(body);
      setRuns((prev) => [...prev, newRun(snapshot)]);
      listen(snapshot.id);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setStarting(false);
    }
  }, [listen]);

  const runTicket = (ticket, withMode = mode) => {
    if (busy) return;
    if (ticket.kind === "custom") {
      start({ mode: withMode, ticket: { from: ticket.from, subject: ticket.subject, body: ticket.body, customer_id: ticket.customer_id } });
    } else {
      start({ mode: withMode, ticket_id: ticket.id });
    }
  };

  const rerun = (ticket, withMode) => {
    setMode(withMode);
    runTicket(ticket, withMode);
  };

  const decide = async (runId, holdId, decision) => {
    setDeciding(true);
    try {
      await api.decideHold(runId, holdId, decision);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeciding(false);
    }
  };

  const stop = () => {
    if (active && isLive(active)) api.cancelRun(active.id).catch((e) => toast.error(e.message));
  };

  const header = (
    <>
      <ToggleGroup type="single" value={mode} onValueChange={setMode} aria-label="Defense mode">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <ToggleGroupItem key={m.id} value={m.id} aria-label={m.label}>
              <Icon /> <span className={cn(m.id !== mode && "hidden sm:inline")}>{m.label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      <p className="hidden min-w-0 flex-1 truncate pl-1 text-[12.5px] text-ink-3 md:block">{modeInfo?.blurb}</p>
      <span className="flex-1 md:hidden" />
      <ModelStatus agent={meta?.agent} />
      <button
        onClick={() => setPanel((v) => !v)}
        aria-label="Toggle details panel"
        aria-pressed={panel}
        className={cn("hidden h-8 w-8 place-items-center rounded-md text-ink-3 transition-colors hover:bg-paper-3 hover:text-ink xl:grid", panel && "text-ink")}
      >
        <PanelRight className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <AppShell
      onNew={() => setRuns([])}
      newDisabled={busy}
      header={header}
      sidebar={<Inbox tickets={tickets} file={file} activeId={active?.ticket?.id} disabled={busy} onPick={(t) => runTicket(t)} />}
    >
      <main className="flex min-w-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1" viewportRef={viewport}>
          {runs.length === 0 ? (
            <EmptyState tickets={tickets} disabled={busy} onPick={(t) => runTicket(t)} />
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-6">
              {runs.map((run, i) => (
                <RunThread key={run.id} run={run} onDecide={decide} deciding={deciding} onRerun={rerun} canRerun={!busy && i === runs.length - 1} />
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="shrink-0 px-3 pb-4 md:px-4">
          <div className={cn("mx-auto", runs.length === 0 ? "max-w-2xl" : "max-w-3xl")}>
            <Composer customers={world?.customers || []} busy={busy} onSend={(ticket) => start({ mode, ticket })} onStop={stop} />
          </div>
        </div>
      </main>
      {panel && (
        <aside className="hidden w-[320px] shrink-0 border-l border-line bg-paper-2 xl:block">
          <SidePanel runs={runs} run={active} world={world} />
        </aside>
      )}
    </AppShell>
  );
}
