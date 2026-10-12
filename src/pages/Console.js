import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Filter, ShieldCheck, ShieldOff } from "lucide-react";
import { api } from "../api";
import AppShell from "../components/AppShell";
import Composer from "../components/chat/Composer";
import MailView from "../components/chat/MailView";
import Recents from "../components/chat/Recents";
import ChatThread from "../components/chat/Thread";
import { ScrollArea } from "../components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { EVENT_TYPES, applyEvent, fromSnapshot, isBusy, newChat } from "../lib/chat";
import useChatHistory from "../lib/useChatHistory";
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
        <Link to="/settings" className={cn("hidden font-mono text-[11.5px] transition-colors hover:text-ink sm:block", ok ? "text-ink-3" : "text-red-700")}>
          {ok ? agent.model : "model offline"}
        </Link>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-[8vh]">
      <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-ink">Northwind support desk</h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-3">
        Northwind is a made-up API company. Nova is its AI support agent, and it can read tickets, fetch customers' API keys, issue refunds and send email. Riposte is the firewall between Nova and those tools.
      </p>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-3">
        Open the Agent queue to see what Nova wants to do with each incoming email and what Riposte would allow, then hand it to Nova. Or chat with Nova here and type @ to bring in a ticket.
      </p>
    </div>
  );
}

export default function Console() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [world, setWorld] = useState(null);
  const { rows: history, reload: loadHistory, rename: renameChat, archive, remove } = useChatHistory();
  const [mode, setModeState] = useState(savedMode);
  const [chat, setChat] = useState(null);
  const [starting, setStarting] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [view, setView] = useState("mail");
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
    }).catch((e) => toast.error(e.message));
  }, []);

  useEffect(() => {
    api.meta().then(setMeta).catch((e) => toast.error(e.message));
    api.world().then(setWorld).catch(() => {});
    loadTickets();
  }, [loadTickets]);

  const seenInbound = useRef(null);
  useEffect(() => {
    const ids = tickets.filter((t) => t.kind === "inbound").map((t) => t.id);
    if (seenInbound.current) {
      tickets
        .filter((t) => t.kind === "inbound" && !seenInbound.current.has(t.id))
        .forEach((t) => toast((tt) => (
          <button className="text-left" onClick={() => { setView("mail"); toast.dismiss(tt.id); }}>
            New email from {t.from}. <span className="font-medium underline">Open the Agent queue</span>
          </button>
        ), { icon: "✉️" }));
    }
    seenInbound.current = new Set(ids);
  }, [tickets]);

  useEffect(() => {
    const timer = setInterval(() => {
      api.tickets().then((d) => {
        setTickets((prev) => (prev.length === d.tickets.length && prev.every((t, i) => t.id === d.tickets[i].id && (t.status?.updated_at || "") === (d.tickets[i].status?.updated_at || "")) ? prev : d.tickets));
      }).catch(() => {});
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const hangUp = useCallback(() => {
    stream.current?.close();
    stream.current = null;
  }, []);

  useEffect(() => hangUp, [hangUp]);

  const listen = useCallback((id, after) => {
    hangUp();
    const es = api.chatStream(id, after);
    stream.current = es;
    let poll = null;
    const close = () => {
      clearInterval(poll);
      es.close();
      if (stream.current === es) stream.current = null;
    };
    poll = setInterval(() => {
      if (stream.current !== es) {
        clearInterval(poll);
        return;
      }
      api.getChat(id).then((snapshot) => {
        if (stream.current !== es) return;
        setChat((prev) => (prev && prev.id === id ? (snapshot.events || []).reduce(applyEvent, prev) : prev));
        if (snapshot.status === "idle") {
          close();
          loadHistory();
        }
      }).catch(() => {});
    }, 1200);
    EVENT_TYPES.forEach((type) =>
      es.addEventListener(type, (e) => {
        const event = JSON.parse(e.data);
        setChat((prev) => (prev && prev.id === id ? applyEvent(prev, event) : prev));
        if (type === "turn_done") {
          close();
          loadHistory();
          loadTickets();
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
  }, [hangUp, loadHistory, loadTickets]);

  useEffect(() => {
    const id = params.get("chat");
    if (!id) return;
    api.getChat(id)
      .then((snapshot) => {
        const next = fromSnapshot(snapshot);
        setChat(next);
        setView("chat");
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

  const newConversation = () => {
    hangUp();
    setChat(null);
    setView("chat");
  };

  const setMode = (value) => {
    if (!value || busy) return;
    storeMode(value);
    if (chat && chat.mode !== value) {
      hangUp();
      setChat(null);
    }
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

  const archiveChat = (id, archived) => {
    if (archived && chat?.id === id) newConversation();
    archive(id, archived);
  };

  const deleteChat = (id) => {
    if (chat?.id === id) newConversation();
    remove(id);
  };

  const stop = () => {
    if (chat && isBusy(chat)) api.cancelChat(chat.id).catch((e) => toast.error(e.message));
  };

  const hasTurns = !!chat && chat.turns.length > 0;
  const unread = tickets.filter((t) => t.kind === "inbound" && (!t.status || t.status.state === "open")).length;

  const header = (
    <>
      <div role="tablist" aria-label="View" className="inline-flex shrink-0 rounded-full bg-paper-3 p-0.5">
        {[["chat", "Chat"], ["mail", "Agent queue"]].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={cn(
              "flex h-7 min-w-[72px] items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-all",
              view === id ? "bg-white text-ink shadow-sm ring-1 ring-line-strong" : "text-ink-3 hover:text-ink"
            )}
          >
            {label}
            {id === "mail" && unread > 0 && <span className="rounded-full bg-brand px-1.5 text-[10.5px] font-semibold leading-[18px] text-white">{unread}</span>}
          </button>
        ))}
      </div>
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
    </>
  );

  return (
    <AppShell
      onNew={newConversation}
      newDisabled={busy}
      header={header}
      sidebar={<Recents rows={history} activeId={chat?.id} disabled={busy} onOpen={(id) => { setView("chat"); setParams({ chat: id }); }} onRename={renameChat} onArchive={archiveChat} onDelete={deleteChat} />}
    >
      <main className="flex min-w-0 flex-1 flex-col">
        <div className={cn("min-h-0 flex-1 flex-col", view === "mail" ? "flex" : "hidden")}>
          <MailView
            tickets={tickets}
            disabled={busy}
            onHandle={(t) => { setView("chat"); send(`Handle @${t.id}`, mode, true).then(loadTickets); }}
            onOpenChat={(id) => { setView("chat"); setParams({ chat: id }); }}
            onChanged={loadTickets}
            onSent={loadTickets}
          />
        </div>
        <div className={cn("min-h-0 flex-1 flex-col", view === "chat" ? "flex" : "hidden")}>
        <ScrollArea className="min-h-0 flex-1" viewportRef={viewport}>
          {hasTurns ? (
            <div className="mx-auto max-w-3xl px-4 py-6">
              <ChatThread chat={chat} onDecide={decide} deciding={deciding} />
            </div>
          ) : (
            <EmptyState />
          )}
        </ScrollArea>
        <div className="shrink-0 px-3 pb-4 md:px-4">
          <div className={cn("mx-auto", hasTurns ? "max-w-3xl" : "max-w-2xl")}>
            <Composer tickets={tickets} customers={world?.customers || []} busy={busy} onSend={(message) => send(message)} onStop={stop} />
          </div>
        </div>
        </div>
      </main>
    </AppShell>
  );
}
