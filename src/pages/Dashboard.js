import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api";
import Deck from "../components/Deck";
import EventTimeline from "../components/EventTimeline";
import InvestigationFeed from "../components/InvestigationFeed";
import ApprovalQueue from "../components/ApprovalQueue";


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
  return (
    <div className="scrollbar-thin flex h-full flex-col gap-5 overflow-y-auto px-6 pb-8 pt-8 lg:px-10 lg:overflow-hidden">
      <Deck
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
        score={score}
      />

      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="h-[32rem] lg:h-auto lg:min-h-0">
          <EventTimeline events={events} narrative={narrative} trusted={trusted} suspected={suspected} running={running} />
        </div>
        <div className="grid gap-5 lg:min-h-0 lg:grid-rows-2">
          <ApprovalQueue actions={actions} onDecide={decide} className="h-80 lg:h-auto" />
          <InvestigationFeed investigations={investigations} className="h-80 lg:h-auto" />
        </div>
      </div>
    </div>
  );
}
