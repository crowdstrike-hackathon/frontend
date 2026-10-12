import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check, X, Zap } from "lucide-react";
import { Panel, Empty, Chip } from "./Sky";

const STATUS = {
  proposed: "bg-amber-500/15 text-amber-700",
  approved: "bg-sky-500/10 text-sky-700",
  denied: "bg-slate-900/5 text-slate-500",
  executed: "bg-emerald-500/15 text-emerald-700",
};

const BTN = "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition";

export default function ApprovalQueue({ actions, onDecide, className }) {
  const seen = new Set();
  const dedup = actions.filter((a) => (seen.has(a.id) ? false : seen.add(a.id)));
  const pending = dedup.filter((a) => a.status === "proposed").length;

  return (
    <Panel
      className={className}
      icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
      title="Your call"
      right={pending > 0 ? <Chip className="bg-amber-500/15 text-amber-700">{pending} waiting</Chip> : <span>response actions</span>}
    >
      {dedup.length === 0 ? (
        <Empty icon={ShieldCheck}>Blue's recommended responses land here. Nothing runs until you approve it.</Empty>
      ) : (
        <ul className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-2">
          <AnimatePresence initial={false}>
            {dedup.map((a) => (
              <motion.li key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-t border-slate-900/5 px-5 py-3.5">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-semibold leading-snug text-slate-900">{a.title}</span>
                  <Chip className={`ml-auto shrink-0 py-0.5 ${STATUS[a.status] || STATUS.denied}`}>{a.status}</Chip>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{a.description}</p>
                <p className="mt-1 break-all font-mono text-[11px] text-slate-500">
                  {a.target}
                  {a.attack_id ? ` · ${a.attack_id}` : ""}
                </p>
                {a.status === "proposed" && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => onDecide(a.id, "approve")} className={`${BTN} bg-sky-700 text-white shadow-md shadow-sky-700/25 hover:bg-sky-800`}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button onClick={() => onDecide(a.id, "deny")} className={`${BTN} border border-slate-300 bg-white/60 text-slate-700 hover:bg-white`}>
                      <X className="h-3.5 w-3.5" /> Deny
                    </button>
                  </div>
                )}
                {a.status === "approved" && (
                  <button onClick={() => onDecide(a.id, "execute")} className={`${BTN} mt-3 w-full flex-none bg-slate-900 text-white hover:bg-slate-800`}>
                    <Zap className="h-3.5 w-3.5" /> Execute now
                  </button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Panel>
  );
}
