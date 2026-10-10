import React from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Gauge, Target, EyeOff, AlertTriangle } from "lucide-react";
import Panel from "./Panel";
import { NumberTicker } from "../ui/aceternity";

export default function Scoreboard({ score, investigations }) {
  if (!score) return null;
  const trend = investigations.map((inv) => ({ turn: inv.turn, confidence: Math.round(inv.confidence * 100) }));
  const total = Math.max(1, score.blue_points + score.red_points);
  const bluePct = (score.blue_points / total) * 100;

  return (
    <Panel icon={<Gauge className="h-4 w-4 text-slate-700" />} title="Engagement scoreboard">
      <div className="relative overflow-hidden px-5 py-4">
        <div className="relative mb-4 grid grid-cols-2 gap-3">
          <ScoreCell color="azure" label="Blue" value={score.blue_points} />
          <ScoreCell color="red" label="Red" value={score.red_points} />
        </div>

        <div className="relative mb-4 h-2 overflow-hidden rounded-full bg-rose-500/40">
          <motion.div initial={{ width: "50%" }} animate={{ width: `${bluePct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500" />
        </div>

        {trend.length > 1 && (
          <div className="relative mb-4 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="turn" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={34} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }} labelStyle={{ color: "#64748b" }} />
                <Area type="monotone" dataKey="confidence" stroke="#0284c7" strokeWidth={2} fill="url(#confGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="relative grid grid-cols-2 gap-2">
          <Stat icon={Target} label="Detection" value={score.detected ? `turn ${score.detection_turn}` : "—"} good={score.detected} />
          <Stat icon={EyeOff} label="Decoys caught" value={`${score.decoys_flagged_correct}/${score.decoy_events}`} good={score.decoy_events === 0 || score.decoys_missed === 0} />
          <Stat icon={AlertTriangle} label="False positive" value={score.false_positive ? "yes" : "no"} good={!score.false_positive} />
          <Stat icon={Gauge} label="Real / decoy" value={`${score.real_events} / ${score.decoy_events}`} />
        </div>
      </div>
    </Panel>
  );
}

function ScoreCell({ color, label, value }) {
  const c = color === "azure" ? "text-sky-600" : "text-rose-600";
  return (
    <div className="rounded-xl border border-slate-900/10 bg-white/70 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-0.5 text-2xl font-black ${c}`}>
        <NumberTicker value={value} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, good }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-900/10 bg-white/70 px-2.5 py-2">
      <Icon className={`h-3.5 w-3.5 ${good === undefined ? "text-slate-500" : good ? "text-emerald-600" : "text-rose-600"}`} />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className="truncate text-xs font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}
