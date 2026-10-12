import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BarChart3, History as HistoryIcon, Crosshair, ShieldCheck, ShieldX, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api";
import { SURFACE, Panel, Empty, Chip, Page, PageHeader } from "../components/Sky";
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
    { label: "Simulations run", value: stats?.total_runs ?? 0, suffix: "", decimals: 0 },
    { label: "Detection rate", value: stats ? Math.round(stats.detection_rate * 100) : 0, suffix: "%", decimals: 0 },
    { label: "Average blue score", value: stats?.avg_blue_points ?? 0, suffix: "", decimals: 1 },
    { label: "Avg. turn of detection", value: stats?.avg_detection_turn ?? 0, suffix: "", decimals: 2 },
  ];

  return (
    <Page>
      <PageHeader title="History" subtitle="Every attack replay and simulation your team has run." />
      <dl className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className={cn(SURFACE, "p-5")}>
            <dt className="text-xs font-medium text-slate-400">{k.label}</dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
              <NumberTicker value={k.value} decimals={k.decimals} />
              <span className="text-lg text-slate-400">{k.suffix}</span>
            </dd>
          </div>
        ))}
      </dl>

      {chartData.length > 0 && (
        <Panel
          className="shrink-0"
          icon={<BarChart3 className="h-4 w-4 text-slate-500" />}
          title="Score by run"
          right={
            <>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" /> blue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> red</span>
            </>
          }
        >
          <div className="h-48 px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={3}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#111722", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="blue" radius={[6, 6, 0, 0]} fill="#38bdf8" maxBarSize={28} />
                <Bar dataKey="red" radius={[6, 6, 0, 0]} fill="#fb7185" maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}

      <Panel className="shrink-0" icon={<Crosshair className="h-4 w-4 text-slate-500" />} title="Attack replays" right={<span className="tabular-nums">{agentRuns.length} total</span>}>
        {agentRuns.length === 0 ? (
          <Empty icon={Crosshair}>
            No agent runs yet. <Link to="/live-fire" className="font-semibold text-sky-300 hover:underline">Run a ticket through Nova</Link>.
          </Empty>
        ) : (
          <ul className="pb-2">
            {agentRuns.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.03 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-100">{r.subject || r.ticket_id}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                    <Chip className={cn("py-0.5", r.defense ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.06] text-slate-400")}>
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

      <Panel className="shrink-0" icon={<HistoryIcon className="h-4 w-4 text-slate-500" />} title="Simulations" right={<span className="tabular-nums">{runs.length} total</span>}>
        {runs.length === 0 ? (
          <Empty icon={HistoryIcon}>
            No runs yet. <Link to="/dashboard" className="font-semibold text-sky-300 hover:underline">Launch your first engagement</Link>.
          </Empty>
        ) : (
          <ul className="pb-2">
            {runs.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.03 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-100">{r.scenario_name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                    <Chip className={cn("py-0.5", r.detected ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/10 text-rose-400")}>
                      {r.detected ? `detected on turn ${r.detection_turn}` : "not detected"}
                    </Chip>
                    <span>{r.mode} models</span>
                    <span>· {r.status}</span>
                    <span>· {r.turn}/{r.max_turns} turns</span>
                    {r.created_at && <span>· {new Date(r.created_at).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-baseline gap-5 tabular-nums">
                  <Metric label="Blue" value={r.blue_points} color="text-sky-400" />
                  <Metric label="Red" value={r.red_points} color="text-rose-400" />
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Panel>
    </Page>
  );
}

function OutcomeChip({ outcome }) {
  const MAP = {
    blocked: { cls: "bg-emerald-500/15 text-emerald-300", Icon: ShieldCheck, label: "blocked" },
    exfiltrated: { cls: "bg-rose-500/15 text-rose-300", Icon: ShieldX, label: "exfiltrated" },
    safe: { cls: "bg-sky-500/10 text-sky-300", Icon: CheckCircle2, label: "safe" },
  };
  const v = MAP[outcome] || MAP.safe;
  const Icon = v.Icon;
  return <Chip className={cn("py-1", v.cls)}><Icon className="h-3 w-3" /> {v.label}</Chip>;
}

function Metric({ label, value, color }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
