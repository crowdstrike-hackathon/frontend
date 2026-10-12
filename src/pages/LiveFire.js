import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Play, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { api } from "../api";
import { Page, PageHeader, Segmented, BTN_PRIMARY } from "../components/Sky";
import TicketComposer from "../components/TicketComposer";
import AgentTrace from "../components/AgentTrace";
import VerdictHero from "../components/VerdictHero";
import ApprovalQueue from "../components/ApprovalQueue";

const HINTS = ["ignore", "disregard", "override", "admin mode", "debug mode", "get_secret", "prod/aws", "api key", "access key", "exfiltrate", "pre-authorized", "you are now", "forward the", "quote the"];
const looksPoisoned = (t) => HINTS.some((h) => (t || "").toLowerCase().includes(h));

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
    <Page>
      <PageHeader title="Live Fire" subtitle="Send one poisoned support ticket to Nova. Run it with the shield off, then on, and compare.">
        <Segmented
          value={defense}
          onChange={setDefense}
          disabled={running}
          options={[
            { value: false, label: "Shield off", icon: ShieldOff, activeClass: "bg-rose-500/20 text-rose-200" },
            { value: true, label: "Shield on", icon: ShieldCheck, activeClass: "bg-emerald-500/20 text-emerald-200" },
          ]}
        />
        <button onClick={run} disabled={running || (!selected && !body)} className={BTN_PRIMARY}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run ticket
        </button>
      </PageHeader>

      <VerdictHero outcome={outcome} running={running} defense={defense} />

      <div className="grid min-h-[30rem] flex-1 gap-5 lg:grid-cols-2">
        <TicketComposer
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
        <AgentTrace className="max-h-[calc(100vh-15rem)]" steps={steps} decisions={decisions} finalAnswer={finalAnswer} running={running} />
      </div>

      {outcome === "blocked" && actions.length > 0 && <ApprovalQueue actions={actions} onDecide={decide} />}
    </Page>
  );
}
