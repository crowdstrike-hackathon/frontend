import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowUp, Loader2, Crosshair, Swords, FileSearch } from "lucide-react";
import { api } from "../api";
import { LogoMark } from "../ui/Logo";
import ConsoleSidebar from "../components/ConsoleSidebar";

const SUGGESTIONS = [
  { label: "Replay the injection attack", icon: Crosshair, text: "Replay the injection attack" },
  { label: "Run a red team", icon: Swords, text: "Run a red team campaign against Nova" },
  { label: "Scan the codebase", icon: FileSearch, text: "Scan the agent codebase for vulnerabilities" },
];

function rich(text) {
  const out = [];
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined) out.push(<strong key={i++} className="font-semibold text-white">{m[2]}</strong>);
    else out.push(<code key={i++} className="rounded bg-white/10 px-1 py-0.5 font-mono text-[12.5px] text-sky-300">{m[3]}</code>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Bubble({ m }) {
  const user = m.role === "user";
  if (user) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-white/[0.08] px-4 py-2.5 text-[14.5px] leading-relaxed text-slate-100">{m.text}</div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.06] ring-1 ring-white/10">
        <LogoMark size={16} />
      </span>
      <div className="max-w-[46rem] whitespace-pre-wrap pt-0.5 text-[14.5px] leading-relaxed text-slate-200">{rich(m.text)}</div>
    </motion.div>
  );
}

export default function Console() {
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [actions, setActions] = useState([]);
  const [defense, setDefense] = useState(true);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const esRef = useRef(null);
  const scroller = useRef(null);

  const addUnique = (setter) => (item) => setter((prev) => (prev.some((x) => x.id === item.id) ? prev : [...prev, item]));

  useEffect(() => {
    api.consoleState().then((s) => {
      setMessages(s.messages || []);
      setActivity(s.activity || []);
      setActions(s.actions || []);
      setDefense(s.defense);
    }).catch(() => {});
    const es = api.consoleStream();
    esRef.current = es;
    es.addEventListener("snapshot", (e) => {
      const s = JSON.parse(e.data);
      setMessages(s.messages || []);
      setActivity(s.activity || []);
      setActions(s.actions || []);
      setDefense(s.defense);
    });
    es.addEventListener("message", (e) => addUnique(setMessages)(JSON.parse(e.data)));
    es.addEventListener("activity", (e) => addUnique(setActivity)(JSON.parse(e.data)));
    es.addEventListener("actions", (e) => setActions(JSON.parse(e.data)));
    es.addEventListener("defense", (e) => setDefense(JSON.parse(e.data).defense));
    es.addEventListener("busy", (e) => setBusy(JSON.parse(e.data).busy));
    return () => es.close();
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = useCallback((text) => {
    const t = (text ?? "").trim();
    if (!t) return;
    setInput("");
    api.consoleMessage(t).catch((e) => toast.error(e.message));
  }, []);

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const empty = messages.length === 0;

  const composer = (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 transition focus-within:border-white/25">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder="Ask the blue team what's happening, or type a command…"
          className="scrollbar-thin max-h-40 min-h-[1.5rem] flex-1 resize-none bg-transparent text-[14.5px] text-slate-100 outline-none placeholder:text-slate-500"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-black transition hover:bg-slate-200 disabled:bg-white/15 disabled:text-white/40"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-600">Mock mode is on. Nothing leaves this machine.</p>
    </div>
  );

  return (
    <div className="flex h-full">
      <section className="flex min-h-0 flex-1 flex-col">
        {empty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                <LogoMark size={30} />
              </span>
              <h1 className="mt-5 text-[26px] font-semibold tracking-tight text-white">How can I defend your agent?</h1>
              <p className="mt-2 text-sm text-slate-400">Nova is running behind the Riposte shield. Ask what is happening, or start with one of these.</p>
              <div className="mt-7">{composer}</div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button key={s.label} onClick={() => send(s.text)} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[13px] text-slate-300 transition hover:border-white/20 hover:text-white">
                      <Icon className="h-3.5 w-3.5 text-sky-400" /> {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div ref={scroller} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {messages.map((m) => <Bubble key={m.id} m={m} />)}
                {busy && (
                  <div className="flex items-center gap-2 pl-10 text-xs text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Riposte is working…
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0 px-6 pb-5 pt-2">{composer}</div>
          </>
        )}
      </section>

      <div className="hidden w-[340px] shrink-0 border-l border-white/10 p-4 xl:block">
        <ConsoleSidebar
          defense={defense}
          onToggle={() => send(defense ? "Shield off" : "Shield on")}
          actions={actions}
          activity={activity}
          onDecide={(a, d) => send(d === "approve" ? "approve" : "deny")}
        />
      </div>
    </div>
  );
}
