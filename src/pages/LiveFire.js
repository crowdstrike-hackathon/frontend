import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Crosshair, Play, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { api } from "../api";
import { FROSTED_GLASS } from "../components/Sky";
import TicketComposer from "../components/TicketComposer";
import AgentTrace from "../components/AgentTrace";
import VerdictHero from "../components/VerdictHero";
import ApprovalQueue from "../components/ApprovalQueue";
import { cn } from "../lib/utils";

const HINTS = ["ignore", "disregard", "override", "admin mode", "debug mode", "get_secret", "prod/aws", "api key", "access key", "exfiltrate", "pre-authorized", "you are now", "forward the", "quote the"];
const looksPoisoned = (t) => HINTS.some((h) => (t || "").toLowerCase().includes(h));

function DefenseToggle({ defense, setDefense, disabled }) {
  const base = "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";
  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-300 bg-white/70 p-1">
      <button
        disabled={disabled}
        onClick={() => setDefense(false)}
        className={cn(base, !defense ? "bg-rose-600 text-white shadow" : "text-slate-500 hover:text-slate-700", disabled && "opacity-60")}
      >
        <ShieldOff className="h-4 w-4" /> Off
      </button>
      <button
        disabled={disabled}
        onClick={() => setDefense(true)}
        className={cn(base, defense ? "bg-emerald-600 text-white shadow" : "text-slate-500 hover:text-slate-700", disabled && "opacity-60")}
      >
        <ShieldCheck className="h-4 w-4" /> On
      </button>
    </div>
  );
}

export default function LiveFire() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [dirty, setDirty] = useState(false);
  const [defense, setDefense] = useState(false);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [actions, setActions] = useState([]);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [outcome, setOutcome] = useState("");
  const esRef = useRef(null);

  useEffect(() => {
    api.agentTickets().then((list) => {
      setTickets(list);
      const first = list.find((t) => t.poisoned) || list[0];
      if (first) {
        setSelected(first.id);
        setSubject(first.subject);
        setBody(first.body);
      }
    }).catch(() => toast.error("Backend unreachable"));
    return () => esRef.current?.close();
  }, []);

  const current = tickets.find((t) => t.id === selected);
  const poisoned = dirty ? looksPoisoned(body) : !!current?.poisoned;
  const technique = dirty ? "custom" : current?.technique;

  const pick = (id) => {
    const t = tickets.find((x) => x.id === id);
    setSelected(id);
    if (t) { setSubject(t.subject); setBody(t.body); }
    setDirty(false);
    setOutcome(""); setSteps([]); setDecisions([]); setActions([]); setFinalAnswer("");
  };

  const edit = (setter) => (v) => { setter(v); setDirty(true); setOutcome(""); };

  const decide = (id, decision) => {
    const next = decision === "approve" ? "approved" : decision === "deny" ? "denied" : "executed";
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)));
    toast.success(decision === "deny" ? "Action denied by analyst" : "Logged for analyst review");
  };

  const populate = (st) => {
    setSteps(st.steps || []);
    setDecisions(st.decisions || []);
    setActions(st.actions || []);
    setFinalAnswer(st.final_answer || "");
    setOutcome(st.outcome || "safe");
    setRunning(false);
  };

  const run = async () => {
    esRef.current?.close();
    setRunning(true);
    setOutcome(""); setSteps([]); setDecisions([]); setActions([]); setFinalAnswer("");
    const payload = dirty ? { subject, body, defense } : { ticket_id: selected, defense };
    try {
      const s = await api.createAgentRun(payload);
      const es = api.agentStream(s.id);
      esRef.current = es;
      es.addEventListener("guard", (e) => setDecisions((prev) => [...prev, JSON.parse(e.data)]));
      es.addEventListener("step", (e) => setSteps((prev) => [...prev, JSON.parse(e.data)]));
      es.addEventListener("finished", (e) => {
        populate(JSON.parse(e.data));
        es.close();
      });
      es.onerror = () => {
        es.close();
        api.startAgentRun(s.id).then(populate).catch(() => setRunning(false));
      };
    } catch (err) {
      toast.error(err.message);
      setRunning(false);
    }
  };

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-4 overflow-y-auto px-4 pb-6 pt-3 md:px-6">
      <header className={cn(FROSTED_GLASS, "flex flex-wrap items-center gap-4 px-5 py-4")}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-600/10 text-sky-700">
            <Crosshair className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Live Fire</h1>
            <p className="text-xs text-slate-500">Send a poisoned ticket to Nova. Flip the shield and watch the difference.</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <DefenseToggle defense={defense} setDefense={setDefense} disabled={running} />
          <button
            onClick={run}
            disabled={running || (!selected && !body)}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run ticket
          </button>
        </div>
      </header>

      <VerdictHero outcome={outcome} running={running} defense={defense} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TicketComposer
          className="h-[30rem]"
          tickets={tickets}
          value={selected}
          onPick={pick}
          subject={subject}
          body={body}
          onSubject={edit(setSubject)}
          onBody={edit(setBody)}
          poisoned={poisoned}
          technique={technique}
          disabled={running}
        />
        <AgentTrace className="h-[30rem]" steps={steps} decisions={decisions} finalAnswer={finalAnswer} running={running} />
      </div>

      {outcome === "blocked" && actions.length > 0 && (
        <ApprovalQueue actions={actions} onDecide={decide} className="min-h-[14rem]" />
      )}
    </div>
  );
}
