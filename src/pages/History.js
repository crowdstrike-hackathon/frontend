import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BarChart3, History as HistoryIcon, Crosshair, ShieldCheck, ShieldX, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api";
import { CLEAR_GLASS, Panel, Empty, Chip } from "../components/Sky";
import { NumberTicker } from "../ui/aceternity";
import { cn } from "../lib/utils";

export default function History() {
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState(null);
  const [agentRuns, setAgentRuns] = useState([]);

  useEffect(() => {
    Promise.all([api.history(), api.stats()])
      .then(([h, s]) => { setRuns(h); setStats(s); })
      .catch((e) => toast.error(e.message));
    api.agentHistory().then(setAgentRuns).catch(() => {});
  }, []);

  const chartData = [...runs].reverse().map((r, i) => ({ name: `#${i + 1}`, blue: r.blue_points, red: r.red_points }));

  const KPIS = [
    { label: "Engagements run", value: stats?.total_runs ?? 0, suffix: "", decimals: 0 },
    { label: "Detection rate", value: stats ? Math.round(stats.detection_rate * 100) : 0, suffix: "%", decimals: 0 },
    { label: "Average blue score", value: stats?.avg_blue_points ?? 0, suffix: "", decimals: 1 },
    { label: "Average turn of detection", value: stats?.avg_detection_turn ?? 0, suffix: "", decimals: 2 },
  ];

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-4 overflow-y-auto px-4 pb-6 pt-3 md:px-6">
      <section className={cn(CLEAR_GLASS, "shrink-0 p-5 text-white lg:p-6")}>
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/75">History</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Every engagement your team has run</h1>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div key={k.label} className="border-l border-white/25 pl-4">
              <dt className="text-xs text-white/80">{k.label}</dt>
              <dd className="mt-1 text-4xl font-semibold tabular-nums leading-none">
                <NumberTicker value={k.value} decimals={k.decimals} />
                {k.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {chartData.length > 0 && (
        <Panel
          className="shrink-0"
          icon={<BarChart3 className="h-4 w-4 text-sky-600" />}
          title="Score by run"
          right={
            <>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-600" /> blue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-600" /> red</span>
            </>
          }
        >
          <div className="h-48 px-5 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={3}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(15,23,42,0.04)" }} contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="blue" radius={[6, 6, 0, 0]} fill="#0284c7" maxBarSize={28} />
                <Bar dataKey="red" radius={[6, 6, 0, 0]} fill="#e11d48" maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}

      <Panel className="shrink-0" icon={<Crosshair className="h-4 w-4 text-sky-600" />} title="Agent firewall runs" right={<span className="tabular-nums">{agentRuns.length} total</span>}>
        {agentRuns.length === 0 ? (
          <Empty icon={Crosshair}>
            No agent runs yet. <Link to="/live-fire" className="font-semibold text-sky-700 hover:underline">Run a ticket through Nova</Link>.
          </Empty>
        ) : (
          <ul className="pb-2">
            {agentRuns.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.03 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-900/5 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">{r.subject || r.ticket_id}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                    <Chip className={cn("py-0.5", r.defense ? "bg-emerald-500/15 text-emerald-700" : "bg-slate-900/5 text-slate-500")}>
                      {r.defense ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />} defense {r.defense ? "on" : "off"}
                    </Chip>
                    <span>{r.mode} models</span>
                    <span>· {r.step_count} steps</span>
                    {r.created_at && <span>· {new Date(r.created_at).toLocaleString()}</span>}
                  </div>
                </div>
                <OutcomeChip outcome={r.outcome} />
              </motion.li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="shrink-0" icon={<HistoryIcon className="h-4 w-4 text-sky-600" />} title="War Room runs" right={<span className="tabular-nums">{runs.length} total</span>}>
        {runs.length === 0 ? (
          <Empty icon={HistoryIcon}>
            No runs yet. <Link to="/dashboard" className="font-semibold text-sky-700 hover:underline">Launch your first engagement</Link>.
          </Empty>
        ) : (
          <ul className="pb-2">
            {runs.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.03 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-900/5 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">{r.scenario_name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                    <Chip className={cn("py-0.5", r.detected ? "bg-emerald-500/15 text-emerald-700" : "bg-rose-500/10 text-rose-600")}>
                      {r.detected ? `detected on turn ${r.detection_turn}` : "not detected"}
                    </Chip>
                    <span>{r.mode} models</span>
                    <span>· {r.status}</span>
                    <span>· {r.turn}/{r.max_turns} turns</span>
                    {r.created_at && <span>· {new Date(r.created_at).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-baseline gap-5 tabular-nums">
                  <Metric label="Blue" value={r.blue_points} color="text-sky-600" />
                  <Metric label="Red" value={r.red_points} color="text-rose-600" />
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function OutcomeChip({ outcome }) {
  const MAP = {
    blocked: { cls: "bg-emerald-500/15 text-emerald-700", Icon: ShieldCheck, label: "blocked" },
    exfiltrated: { cls: "bg-rose-500/15 text-rose-700", Icon: ShieldX, label: "exfiltrated" },
    safe: { cls: "bg-sky-500/10 text-sky-700", Icon: CheckCircle2, label: "safe" },
  };
  const v = MAP[outcome] || MAP.safe;
  const Icon = v.Icon;
  return <Chip className={cn("py-1", v.cls)}><Icon className="h-3 w-3" /> {v.label}</Chip>;
}

function Metric({ label, value, color }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
