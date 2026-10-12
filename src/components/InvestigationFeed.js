import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { Brain } from "lucide-react";
import { Panel, Empty, Chip } from "./Sky";
import { VERDICT_STYLE } from "../lib/utils";

export default function InvestigationFeed({ investigations, className }) {
  const ordered = [...investigations].reverse();
  const trend = investigations.map((inv) => ({ turn: inv.turn, confidence: Math.round(inv.confidence * 100) }));

  return (
    <Panel className={className} icon={<Brain className="h-4 w-4 text-slate-500" />} title="Blue team verdicts" right={<span>verdict per turn</span>}>
      {ordered.length === 0 ? (
        <Empty icon={Brain}>After each turn the defender posts a verdict, how sure it is, and why.</Empty>
      ) : (
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-2">
          {trend.length > 1 && (
            <div className="px-4 pb-3">
              <div className="text-[11px] text-slate-400">Confidence by turn</div>
              <div className="mt-1 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                    <defs>
                      <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      formatter={(v) => [`${v}%`, "confidence"]}
                      labelFormatter={(_, p) => (p[0] ? `turn ${p[0].payload.turn}` : "")}
                      contentStyle={{ background: "#111722", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", borderRadius: 12, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="confidence" stroke="#38bdf8" strokeWidth={2} fill="url(#confGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          <ul>
            <AnimatePresence initial={false}>
              {ordered.map((inv) => {
                const s = VERDICT_STYLE[inv.verdict] || VERDICT_STYLE.benign;
                return (
                  <motion.li key={inv.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-t border-white/[0.06] px-4 py-3.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <Chip className={`py-0.5 font-bold ${s.text} ${s.bg}`}>{s.label}</Chip>
                      <span className="text-slate-400">turn {inv.turn}</span>
                      <span className="ml-auto font-medium tabular-nums text-slate-300">{Math.round(inv.confidence * 100)}% sure</span>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold leading-snug text-slate-100">{inv.headline}</div>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{inv.reasoning}</p>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </Panel>
  );
}
