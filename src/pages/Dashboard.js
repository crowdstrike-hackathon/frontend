import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Cpu, Server, Swords, ShieldCheck, Activity, Shield } from "lucide-react";
import { api } from "../api";
import ScenarioPicker from "../components/ScenarioPicker";
import EventTimeline from "../components/EventTimeline";
import InvestigationFeed from "../components/InvestigationFeed";
import ApprovalQueue from "../components/ApprovalQueue";
import Scoreboard from "../components/Scoreboard";
import { SpotlightNew, AnimatedTooltip, InfiniteMovingCards } from "../ui/aceternity";

const TECHS = [
  { id: "T1566.002", name: "Prompt Injection", icon: <Swords className="h-3.5 w-3.5 text-red" /> },
  { id: "T1059", name: "Tool Abuse", icon: <Activity className="h-3.5 w-3.5 text-amber" /> },
  { id: "T1552.005", name: "Cloud Creds", icon: <Cpu className="h-3.5 w-3.5 text-azure" /> },
  { id: "T1530", name: "Cloud Exfil", icon: <Server className="h-3.5 w-3.5 text-red" /> },
  { id: "T1621", name: "MFA Fatigue", icon: <Shield className="h-3.5 w-3.5 text-amber" /> },
  { id: "T1078", name: "Valid Accounts", icon: <ShieldCheck className="h-3.5 w-3.5 text-lime" /> },
  { id: "T1550.001", name: "Alt Auth Material", icon: <Activity className="h-3.5 w-3.5 text-azure" /> },
];

export default function Dashboard() {
  const [meta, setMeta] = useState(null);
  const [selected, setSelected] = useState(null);
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [actions, setActions] = useState([]);
  const [score, setScore] = useState(null);
  const [narrative, setNarrative] = useState("");
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const esRef = useRef(null);

  useEffect(() => {
    api.meta().then((m) => {
      setMeta(m);
      if (m.scenarios[0]) setSelected(m.scenarios[0].id);
    }).catch(() => toast.error("Backend unreachable"));
    return () => esRef.current?.close();
  }, []);

  const upsertActions = useCallback((incoming) => {
    setActions((prev) => {
      const byId = new Map(prev.map((a) => [a.id, a]));
      for (const a of incoming) byId.set(a.id, { ...byId.get(a.id), ...a });
      return Array.from(byId.values());
    });
  }, []);

  const launch = async () => {
    setBusy(true);
    setEvents([]); setInvestigations([]); setActions([]); setScore(null); setNarrative("");
    try {
      const s = await api.createSession(selected);
      setSession(s);
      const es = api.stream(s.id);
      esRef.current = es;
      es.addEventListener("snapshot", (e) => {
        const st = JSON.parse(e.data);
        setEvents(st.events || []);
        setInvestigations(st.investigations || []);
        setActions(st.actions || []);
        setScore(st.score || null);
      });
      es.addEventListener("red_turn", (e) => {
        const p = JSON.parse(e.data);
        setNarrative(`Turn ${p.turn} · ${p.narrative}`);
        setEvents((prev) => [...prev, ...p.events]);
      });
      es.addEventListener("blue_turn", (e) => {
        const inv = JSON.parse(e.data);
        setInvestigations((prev) => [...prev, inv]);
        upsertActions(inv.recommended_actions || []);
      });
      es.addEventListener("score", (e) => setScore(JSON.parse(e.data)));
      es.addEventListener("action_update", (e) => upsertActions([JSON.parse(e.data)]));
      es.addEventListener("finished", (e) => {
        setScore(JSON.parse(e.data));
        setRunning(false);
        toast.success("Engagement complete");
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const step = async () => {
    setBusy(true);
    try { await api.step(session.id); } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const run = async () => {
    setRunning(true);
    try { await api.run(session.id); } catch (e) { toast.error(e.message); setRunning(false); }
  };
  const decide = (actionId, decision) => api.decide(session.id, actionId, decision).catch((e) => toast.error(e.message));

  const last = investigations[investigations.length - 1];
  const trusted = new Set(last ? last.trusted_event_ids : []);
  const suspected = new Set(last ? last.suspected_decoy_ids : []);
  const live = meta?.mode === "live";

  const providers = meta
    ? [
        { id: 1, name: meta.blue.provider, designation: `Blue · ${meta.blue.model}`, initials: "B" },
        { id: 2, name: meta.red.provider, designation: `Red · ${meta.red.model}`, initials: "R" },
      ]
    : [];

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <SpotlightNew translateY={-260} height={900} />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex items-center gap-4 border-b border-white/5 px-6 py-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight">War Room</h1>
          <p className="text-xs text-slate-500">Autonomous red vs blue engagement</p>
        </div>
        <div className="mx-auto hidden min-w-0 max-w-sm flex-1 md:block">
          <InfiniteMovingCards items={TECHS} speed="slow" />
        </div>
        <div className="flex items-center gap-3">
          {providers.length > 0 && <AnimatedTooltip items={providers} />}
          <ModePill live={live} />
        </div>
      </motion.div>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-6 lg:grid-cols-[300px_1fr_360px]">
        <div className="min-h-0 overflow-y-auto scrollbar-thin">
          <ScenarioPicker
            meta={meta}
            scenarios={meta?.scenarios || []}
            selected={selected}
            onSelect={setSelected}
            started={!!session}
            busy={busy}
            running={running}
            onLaunch={launch}
            onStep={step}
            onRun={run}
            turn={investigations.length}
            maxTurns={meta?.scenarios.find((s) => s.id === selected)?.stages || 0}
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <EventTimeline events={events} narrative={narrative} trusted={trusted} suspected={suspected} running={running} />
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto scrollbar-thin">
          <Scoreboard score={score} investigations={investigations} />
          <InvestigationFeed investigations={investigations} />
          <ApprovalQueue actions={actions} onDecide={decide} />
        </div>
      </div>
    </div>
  );
}

function ModePill({ live }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${live ? "bg-lime/10 text-lime ring-lime/30" : "bg-amber/10 text-amber ring-amber/30"}`}>
      {live ? "Live" : "Mock"}
    </span>
  );
}
