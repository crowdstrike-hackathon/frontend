import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check, X, Zap, Crosshair } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const STATUS = {
  proposed: "text-amber bg-amber/10 ring-amber/30",
  approved: "text-lime bg-lime/10 ring-lime/30",
  denied: "text-red bg-red/10 ring-red/30",
  executed: "text-azure bg-azure/10 ring-azure/30",
};

export default function ApprovalQueue({ actions, onDecide }) {
  const seen = new Set();
  const dedup = actions.filter((a) => (seen.has(a.id) ? false : seen.add(a.id)));
  const pending = dedup.filter((a) => a.status === "proposed").length;

  return (
    <GlassCard className="flex min-h-0 flex-col" spotlight={false}>
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <ShieldCheck className="h-4 w-4 text-lime" />
        <h3 className="text-sm font-semibold">Governed response</h3>
        <span className="text-xs text-slate-500">· human-in-the-loop</span>
        {pending > 0 && (
          <span className="ml-auto rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-bold text-amber">
            {pending} pending
          </span>
        )}
      </div>
      <div className="scrollbar-thin max-h-[320px] flex-1 overflow-y-auto px-4 py-3">
        {dedup.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">No response actions proposed yet.</div>
        )}
        <AnimatePresence initial={false}>
          {dedup.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3"
            >
              <div className="flex items-start gap-2">
                <Crosshair className="mt-0.5 h-4 w-4 shrink-0 text-red/80" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-100">{a.title}</span>
                    <span className={`ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ${STATUS[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{a.description}</p>
                  <div className="mt-1.5 font-mono text-[11px] text-azure">
                    ⌁ {a.target}{a.attack_id ? ` · ${a.attack_id}` : ""}
                  </div>
                </div>
              </div>
              {a.status === "proposed" && (
                <div className="mt-2.5 flex gap-2">
                  <button onClick={() => onDecide(a.id, "approve")} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-lime/15 py-1.5 text-xs font-semibold text-lime transition hover:bg-lime/25">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button onClick={() => onDecide(a.id, "deny")} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-red/15 hover:text-red">
                    <X className="h-3.5 w-3.5" /> Deny
                  </button>
                </div>
              )}
              {a.status === "approved" && (
                <button onClick={() => onDecide(a.id, "execute")} className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-azure/15 py-1.5 text-xs font-semibold text-azure transition hover:bg-azure/25">
                  <Zap className="h-3.5 w-3.5" /> Execute now
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
