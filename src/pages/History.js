import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { History as HistoryIcon, Activity, Target, Gauge, Clock, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api";
import Panel from "../components/Panel";
import { NumberTicker, GlowingEffect } from "../ui/aceternity";

export default function History() {
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([api.history(), api.stats()])
      .then(([h, s]) => { setRuns(h); setStats(s); })
      .catch((e) => toast.error(e.message));
  }, []);

  const chartData = [...runs].reverse().map((r, i) => ({ name: `#${i + 1}`, blue: r.blue_points, red: r.red_points }));

  const KPIS = [
    { icon: Activity, label: "Total runs", value: stats?.total_runs ?? 0, color: "text-slate-900", suffix: "", decimals: 0 },
    { icon: Target, label: "Detection rate", value: stats ? Math.round(stats.detection_rate * 100) : 0, color: "text-emerald-600", suffix: "%", decimals: 0 },
    { icon: Gauge, label: "Avg blue score", value: stats?.avg_blue_points ?? 0, color: "text-sky-600", suffix: "", decimals: 1 },
    { icon: Clock, label: "Avg detect turn", value: stats?.avg_detection_turn ?? 0, color: "text-amber-600", suffix: "", decimals: 2 },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 pb-1 pt-5">
        <HistoryIcon className="h-5 w-5 text-sky-700" />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Engagement History</h1>
          <p className="text-xs text-slate-500">Every run your team has fought, scored and persisted</p>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-6">
        <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {KPIS.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <GlowingEffect disabled={false} glow proximity={64} spread={30} borderWidth={2} />
                <div className="relative z-20">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-600">
                    <Icon className="h-3.5 w-3.5" /> {k.label}
                  </div>
                  <div className={`mt-1 text-3xl font-black ${k.color}`}>
                    <NumberTicker value={k.value} decimals={k.decimals} />{k.suffix}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {chartData.length > 0 && (
          <Panel icon={<Gauge className="h-4 w-4 text-slate-700" />} title="Blue vs Red across runs" className="mb-5">
            <div className="h-56 px-5 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(15,23,42,0.04)" }} contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }} />
                  <Bar dataKey="blue" radius={[4, 4, 0, 0]} fill="#0284c7" />
                  <Bar dataKey="red" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill="#e11d48" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        <div className="space-y-2.5">
          {runs.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-500">No runs yet. Head to the dashboard and launch your first engagement.</div>
          )}
          {runs.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <div className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <GlowingEffect disabled={false} glow proximity={64} spread={30} borderWidth={2} />
                <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${r.detected ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30" : "bg-rose-500/10 text-rose-600 ring-rose-500/30"}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div className="relative min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">{r.scenario_name}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className={`rounded px-1.5 py-0.5 font-bold uppercase ${r.mode === "live" ? "text-emerald-600" : "text-amber-600"}`}>{r.mode}</span>
                    <span>·</span><span>{r.status}</span>
                    <span>·</span><span>{r.turn}/{r.max_turns} turns</span>
                    {r.detected && <><span>·</span><span className="text-emerald-600">detected t{r.detection_turn}</span></>}
                    {r.created_at && <><span>·</span><span>{new Date(r.created_at).toLocaleString()}</span></>}
                  </div>
                </div>
                <div className="relative flex items-center gap-4 text-right">
                  <Metric label="Blue" value={r.blue_points} color="text-sky-600" />
                  <Metric label="Red" value={r.red_points} color="text-rose-600" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-lg font-black ${color}`}>{value}</div>
    </div>
  );
}
