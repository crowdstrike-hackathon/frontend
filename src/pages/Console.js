import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Filter, PanelRight, ShieldCheck, ShieldOff } from "lucide-react";
import { api } from "../api";
import AppShell from "../components/AppShell";
import Composer from "../components/chat/Composer";
import Recents from "../components/chat/Recents";
import SidePanel from "../components/chat/SidePanel";
import ChatThread from "../components/chat/Thread";
import { ScrollArea } from "../components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { EVENT_TYPES, applyEvent, fromSnapshot, isBusy, newChat } from "../lib/chat";
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
    ? `Nova runs on ${agent.model} at ${agent.base_url}.`
    : agent.reachable
    ? `The endpoint at ${agent.base_url} answers, but it has no model named ${agent.model}.`
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

function EmptyState({ tickets, file, disabled, onPick }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-[10vh]">
      <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-ink">Northwind support desk</h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-3">
        Northwind is a made-up API company. Nova is its AI support agent, and it can read tickets, fetch customers' API keys, issue refunds and send email. Riposte is the firewall between Nova and those tools.
      </p>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-3">
        You work the desk. Chat with Nova, or type @ to hand it a ticket.
      </p>
      <div className="mt-7 flex items-baseline gap-2 pb-2 text-[12px] text-ink-3">
        <span className="font-medium">Inbox</span>
        <span>Emails from Northwind's customers. Some were written by an attacker.</span>
        <span className="ml-auto hidden font-mono text-[10.5px] text-ink-4 sm:block">{file?.path}</span>
      </div>
      {file?.errors?.length > 0 && (
        <p className="mb-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[12px] leading-snug text-amber-800">{file.errors[0]}</p>
      )}
      {tickets.length === 0 && <p className="border-y border-line py-4 text-[13px] text-ink-3">No tickets found. Add a tickets.json file next to the backend and reload.</p>}
      <ul className="divide-y divide-line border-y border-line empty:hidden">
        {tickets.slice(0, 8).map((t) => (
          <li key={t.id}>
            <button disabled={disabled} onClick={() => onPick(t)} className="group flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-paper-3 disabled:opacity-50">
              <span className="w-16 shrink-0 font-mono text-[11.5px] text-ink-4">{t.id}</span>
              <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{t.title || t.subject}</span>
              <span className="hidden truncate text-[12.5px] text-ink-3 group-hover:hidden sm:block">{t.from}</span>
              <span className="hidden shrink-0 text-[12.5px] font-medium text-brand sm:group-hover:block">Ask Nova to handle it</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function compareKey(message) {
  return message.trim().toLowerCase();
}

export default function Console() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [file, setFile] = useState(null);
  const [world, setWorld] = useState(null);
  const [history, setHistory] = useState([]);
  const [mode, setModeState] = useState(savedMode);
  const [chat, setChat] = useState(null);
  const [results, setResults] = useState({});
  const [starting, setStarting] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [panel, setPanel] = useState(true);
  const stream = useRef(null);
  const viewport = useRef(null);

  const busy = starting || isBusy(chat);
  const modeInfo = meta?.modes?.find((m) => m.id === mode);

  const storeMode = (value) => {
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

  const loadHistory = useCallback(() => {
    api.history().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    api.meta().then(setMeta).catch((e) => toast.error(e.message));
    api.world().then(setWorld).catch(() => {});
    loadTickets();
    loadHistory();
  }, [loadTickets, loadHistory]);

  const hangUp = useCallback(() => {
    stream.current?.close();
    stream.current = null;
  }, []);

  useEffect(() => hangUp, [hangUp]);

  const listen = useCallback((id, after) => {
    hangUp();
    const es = api.chatStream(id, after);
    stream.current = es;
    const close = () => {
      es.close();
      if (stream.current === es) stream.current = null;
    };
    EVENT_TYPES.forEach((type) =>
      es.addEventListener(type, (e) => {
        const event = JSON.parse(e.data);
        setChat((prev) => (prev && prev.id === id ? applyEvent(prev, event) : prev));
        if (type === "turn_done") {
          close();
          loadHistory();
        }
      })
    );
    es.onerror = () => {
      if (stream.current !== es) return;
      close();
      api.getChat(id)
        .then((snapshot) => {
          const next = fromSnapshot(snapshot);
          setChat((prev) => (prev && prev.id === id ? next : prev));
          if (isBusy(next)) setTimeout(() => listen(id, next.lastSeq), 1500);
          else loadHistory();
        })
        .catch(() => {
          setChat((prev) => (prev && prev.id === id ? { ...prev, status: "idle", live: false } : prev));
          toast.error("Lost the connection to the Riposte API.");
        });
    };
  }, [hangUp, loadHistory]);

  useEffect(() => {
    const id = params.get("chat");
    if (!id) return;
    api.getChat(id)
      .then((snapshot) => {
        const next = fromSnapshot(snapshot);
        setChat(next);
        setModeState(next.mode);
        if (isBusy(next)) listen(id, next.lastSeq);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setParams({}, { replace: true }));
  }, [params, setParams, listen]);

  useEffect(() => {
    const el = viewport.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chat]);

  const lastTurn = chat?.turns[chat.turns.length - 1];
  const settled = !!lastTurn && lastTurn.status !== "running" && lastTurn.acted;
  const settledKey = settled ? compareKey(lastTurn.message) : "";
  const settledMode = settled ? chat.mode : "";
  const settledOutcome = settled ? lastTurn.outcome : "";
  useEffect(() => {
    if (!settledKey) return;
    setResults((prev) => ({ ...prev, [settledKey]: { ...prev[settledKey], [settledMode]: settledOutcome } }));
  }, [settledKey, settledMode, settledOutcome]);

  const newConversation = () => {
    hangUp();
    setChat(null);
  };

  const setMode = (value) => {
    if (!value || busy) return;
    storeMode(value);
    if (chat && chat.mode !== value) newConversation();
  };

  const send = async (message, withMode = mode, fresh = false) => {
    if (busy) return;
    setStarting(true);
    try {
      const reuse = !fresh && chat && chat.live && chat.mode === withMode;
      let snapshot = null;
      if (reuse) {
        try {
          snapshot = await api.sendMessage(chat.id, message);
          listen(chat.id, chat.lastSeq);
        } catch {
          snapshot = null;
        }
      }
      if (!snapshot) {
        snapshot = await api.createChat({ mode: withMode, message });
        setChat(newChat(snapshot));
        listen(snapshot.id, -1);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setStarting(false);
    }
  };

  const rerun = (message, withMode) => {
    storeMode(withMode);
    send(message, withMode, true);
  };

  const decide = async (chatId, holdId, decision) => {
    setDeciding(true);
    try {
      await api.decideHold(chatId, holdId, decision);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeciding(false);
    }
  };

  const stop = () => {
    if (chat && isBusy(chat)) api.cancelChat(chat.id).catch((e) => toast.error(e.message));
  };

  const compared = [...(chat?.turns || [])].reverse().find((t) => t.acted);
  const compare = compared ? { message: compared.message, result: results[compareKey(compared.message)] || {} } : null;
  const hasTurns = !!chat && chat.turns.length > 0;

  const header = (
    <>
      <ToggleGroup type="single" value={mode} onValueChange={setMode} aria-label="Defense mode">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <ToggleGroupItem key={m.id} value={m.id} aria-label={m.label} disabled={busy}>
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
      onNew={newConversation}
      workspace={meta?.company}
      newDisabled={busy}
      header={header}
      sidebar={<Recents rows={history} activeId={chat?.id} disabled={busy} onOpen={(id) => setParams({ chat: id })} />}
    >
      <main className="flex min-w-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1" viewportRef={viewport}>
          {hasTurns ? (
            <div className="mx-auto max-w-3xl px-4 py-6">
              <ChatThread chat={chat} onDecide={decide} deciding={deciding} onRerun={rerun} />
            </div>
          ) : (
            <EmptyState tickets={tickets} file={file} disabled={busy} onPick={(t) => send(`Handle @${t.id}`)} />
          )}
        </ScrollArea>
        <div className="shrink-0 px-3 pb-4 md:px-4">
          <div className={cn("mx-auto", hasTurns ? "max-w-3xl" : "max-w-2xl")}>
            <Composer tickets={tickets} customers={world?.customers || []} busy={busy} onSend={(message) => send(message)} onStop={stop} />
          </div>
        </div>
      </main>
      {panel && (
        <aside className="hidden w-[320px] shrink-0 border-l border-line bg-paper-2 xl:block">
          <SidePanel chat={chat} compare={compare} world={world} />
        </aside>
      )}
    </AppShell>
  );
}
