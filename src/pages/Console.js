import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Filter, Plus, ShieldCheck, ShieldOff } from "lucide-react";
import { api } from "../api";
import { CloudShader } from "../ui/aceternity";
import { LogoMark } from "../ui/Logo";
import AppBar from "../components/AppBar";
import Composer from "../components/chat/Composer";
import Inbox from "../components/chat/Inbox";
import SidePanel from "../components/chat/SidePanel";
import RunThread from "../components/chat/Thread";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
const PANEL = "rounded-3xl border border-white/60 bg-white/90 shadow-xl shadow-sky-950/10 backdrop-blur-xl";

function savedMode() {
  try {
    const value = localStorage.getItem(MODE_KEY);
    return MODES.some((m) => m.id === value) ? value : "riposte";
  } catch {
    return "riposte";
  }
}

function ModelBadge({ agent }) {
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
        <span className="hidden sm:block">
          <Badge variant="outline" className="h-9 cursor-help gap-2 border-white/60 bg-white/80 px-3 font-mono text-[11.5px] font-medium">
            <span className={cn("h-2 w-2 rounded-full", ok ? "bg-emerald-500" : "bg-rose-500")} />
            {ok ? agent.model : "model offline"}
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}

function EmptyState({ tickets, disabled, onPick }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 ring-1 ring-sky-200"><LogoMark size={32} /></span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Send Nova a ticket</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Nova is a support agent with real tools: it can read customer records, fetch API keys, issue refunds and send email. Pick a ticket or write your own, then switch the defense and run it again.
      </p>
      <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
        {tickets.slice(0, 4).map((t) => (
          <Button key={t.id} variant="outline" size="sm" disabled={disabled} onClick={() => onPick(t)}>
            {t.title || t.subject}
          </Button>
        ))}
      </div>
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

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <CloudShader className="absolute inset-0" skyTopColor="#245a9c" skyBottomColor="#7fb2de" count={4} speed={0.6} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0b2a55]/55 to-transparent" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-3 md:p-4">
        <AppBar right={<ModelBadge agent={meta?.agent} />}>
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
        </AppBar>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className={cn(PANEL, "hidden min-h-0 lg:block")}>
            <Inbox tickets={tickets} file={file} activeId={active?.ticket?.id} disabled={busy} onPick={(t) => runTicket(t)} />
          </aside>

          <main className={cn(PANEL, "flex min-h-0 flex-col overflow-hidden")}>
            <div className="flex shrink-0 items-center gap-3 border-b border-slate-200/80 px-4 py-2.5">
              <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-slate-600">
                <span className="font-semibold text-slate-900">{modeInfo?.label || "Riposte"}.</span> {modeInfo?.blurb}
              </p>
              <Button variant="ghost" size="sm" disabled={busy || runs.length === 0} onClick={() => setRuns([])}>
                <Plus /> New chat
              </Button>
            </div>
            <ScrollArea className="min-h-0 flex-1" viewportRef={viewport}>
              {runs.length === 0 ? (
                <div className="h-[min(60vh,32rem)]">
                  <EmptyState tickets={tickets} disabled={busy} onPick={(t) => runTicket(t)} />
                </div>
              ) : (
                <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-5">
                  {runs.map((run, i) => (
                    <RunThread key={run.id} run={run} onDecide={decide} deciding={deciding} onRerun={rerun} canRerun={!busy && i === runs.length - 1} />
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="shrink-0 px-3 pb-3 pt-1 md:px-4 md:pb-4">
              <div className="mx-auto max-w-3xl">
                <Composer customers={world?.customers || []} busy={busy} onSend={(ticket) => start({ mode, ticket })} onStop={stop} />
              </div>
            </div>
          </main>

          <aside className={cn(PANEL, "hidden min-h-0 overflow-hidden xl:block")}>
            <SidePanel runs={runs} run={active} world={world} />
          </aside>
        </div>
      </div>
    </div>
  );
}
