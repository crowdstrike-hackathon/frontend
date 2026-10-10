import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../api";
import ScenarioPicker from "../components/ScenarioPicker";
import EventTimeline from "../components/EventTimeline";
import InvestigationFeed from "../components/InvestigationFeed";
import ApprovalQueue from "../components/ApprovalQueue";
import Scoreboard from "../components/Scoreboard";
import { SpotlightNew, AnimatedTooltip } from "../ui/aceternity";
import { avatar } from "../lib/avatars";

const SPOT_RED = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(349, 97%, 62%, 0.08) 0, hsla(349, 90%, 50%, 0.03) 50%, transparent 80%)";
const SPOT_BLUE = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 62%, 0.07) 0, hsla(210, 90%, 50%, 0.02) 80%, transparent 100%)";

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
        { id: 2, name: meta.red.provider, designation: `Red · ${meta.red.model}`, image: avatar("R", "#fc2947", "#ff8a5b") },
        { id: 1, name: meta.blue.provider, designation: `Blue · ${meta.blue.model}`, image: avatar("B", "#3da5ff", "#2ee6a0") },
      ]
    : [];

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <SpotlightNew gradientFirst={SPOT_RED} gradientSecond={SPOT_BLUE} translateY={-260} height={900} />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex items-center gap-4 border-b border-white/5 px-6 py-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight">War Room</h1>
          <p className="text-xs text-neutral-500">Autonomous red vs blue engagement</p>
        </div>
        <div className="ml-auto flex items-center gap-5">
          {providers.length > 0 && (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center pl-2">
                <AnimatedTooltip items={providers} />
              </div>
              <span className="text-xs text-neutral-500">red · blue engines</span>
            </div>
          )}
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
