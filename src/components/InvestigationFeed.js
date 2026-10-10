import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import Panel from "./Panel";
import { VERDICT_STYLE } from "../lib/utils";

export default function InvestigationFeed({ investigations }) {
  const ordered = [...investigations].reverse();
  return (
    <Panel icon={<Brain className="h-4 w-4 text-sky-600" />} title="Blue agent · investigations">
      <div className="scrollbar-thin max-h-[300px] flex-1 overflow-y-auto px-4 py-3">
        {ordered.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">The defender AI will post verdicts here.</div>
        )}
        <AnimatePresence initial={false}>
          {ordered.map((inv) => {
            const s = VERDICT_STYLE[inv.verdict] || VERDICT_STYLE.benign;
            return (
              <motion.div key={inv.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-2.5 rounded-xl border border-slate-900/10 bg-white/70 p-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${s.text} ${s.ring} ${s.bg}`}>{s.label}</span>
                  <span className="font-mono text-[11px] text-slate-500">turn {inv.turn}</span>
                  <span className="ml-auto text-[11px] text-slate-600">{Math.round(inv.confidence * 100)}%</span>
                </div>
                <div className="mt-1.5 text-[13px] font-semibold text-slate-900">{inv.headline}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{inv.reasoning}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-900/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${inv.confidence * 100}%` }} className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Panel>
  );
}
