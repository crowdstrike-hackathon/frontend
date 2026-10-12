import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldOff, Crosshair, Terminal, Lock, FileSearch, Activity, Check, X, Zap } from "lucide-react";
import { cn } from "../lib/utils";

const KIND = {
  attack: { Icon: Crosshair, tone: "text-rose-400" },
  block: { Icon: ShieldCheck, tone: "text-emerald-400" },
  tool: { Icon: Terminal, tone: "text-slate-400" },
  gate: { Icon: Lock, tone: "text-amber-400" },
  scan: { Icon: FileSearch, tone: "text-sky-400" },
  info: { Icon: Activity, tone: "text-slate-400" },
};

function ApprovalCard({ a, onDecide }) {
  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3">
      <div className="text-[13px] font-semibold leading-snug text-slate-100">{a.title}</div>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{a.description}</p>
      {a.status === "proposed" ? (
        <div className="mt-2.5 flex gap-2">
          <button onClick={() => onDecide("approve")} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white py-1.5 text-xs font-semibold text-black transition hover:bg-slate-200">
            <Check className="h-3.5 w-3.5" /> Approve
          </button>
          <button onClick={() => onDecide("deny")} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/15 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5">
            <X className="h-3.5 w-3.5" /> Deny
          </button>
        </div>
      ) : (
        <span className={cn("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", a.status === "denied" ? "bg-white/5 text-slate-400" : "bg-emerald-400/15 text-emerald-300")}>
          <Zap className="h-3 w-3" /> {a.status}
        </span>
      )}
    </div>
  );
}

export default function ConsoleSidebar({ defense, onToggle, actions, activity, onDecide }) {
  const pending = actions.filter((a) => a.status === "proposed");
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition",
          defense ? "border-emerald-400/25 bg-emerald-400/[0.06] hover:bg-emerald-400/10" : "border-rose-400/25 bg-rose-400/[0.06] hover:bg-rose-400/10"
        )}
      >
        {defense ? <ShieldCheck className="h-5 w-5 text-emerald-400" /> : <ShieldOff className="h-5 w-5 text-rose-400" />}
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">Shield {defense ? "ON" : "OFF"}</div>
          <div className="text-[11px] text-slate-400">{defense ? "Guard is intercepting tool calls" : "Agent exposed — tap to protect"}</div>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", defense ? "bg-emerald-500 text-black" : "bg-rose-500 text-white")}>{defense ? "ON" : "OFF"}</span>
      </button>

      {pending.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
          <div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-amber-400">
            <Lock className="h-3.5 w-3.5" /> Needs your approval
          </div>
          <div className="flex flex-col gap-2">
            {pending.map((a) => <ApprovalCard key={a.id} a={a} onDecide={(d) => onDecide(a, d)} />)}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 px-3.5 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <Activity className="h-3.5 w-3.5 text-sky-400" /> Live activity
          <span className="ml-auto tabular-nums text-slate-600">{activity.length}</span>
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {activity.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-slate-600">No signals yet. Ask the copilot to replay an attack.</p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              <AnimatePresence initial={false}>
                {[...activity].reverse().map((a) => {
                  const k = KIND[a.kind] || KIND.info;
                  const Icon = k.Icon;
                  return (
                    <motion.li key={a.id} layout initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2.5 rounded-lg px-2 py-2 hover:bg-white/[0.03]">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", k.tone)} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[12.5px] font-medium text-slate-200">{a.title}</span>
                          {a.attack_id && <span className="shrink-0 font-mono text-[10px] text-slate-600">{a.attack_id}</span>}
                        </div>
                        {a.detail && <p className="mt-0.5 break-words text-[11px] leading-snug text-slate-500">{a.detail}</p>}
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
