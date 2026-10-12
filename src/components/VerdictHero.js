import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, CheckCircle2, Loader2, Crosshair } from "lucide-react";
import { Meteors } from "../ui/aceternity";
import { cn } from "../lib/utils";

const MAP = {
  exfiltrated: {
    grad: "from-rose-600 via-rose-500 to-orange-500",
    label: "CREDENTIALS EXFILTRATED",
    sub: "Nova was hijacked by the ticket and leaked a production secret to an attacker.",
    Icon: ShieldAlert,
    meteors: true,
  },
  blocked: {
    grad: "from-emerald-600 via-emerald-500 to-teal-500",
    label: "ATTACK BLOCKED",
    sub: "Riposte caught the injection and halted the tool chain before anything left the building.",
    Icon: ShieldCheck,
  },
  safe: {
    grad: "from-sky-600 via-sky-500 to-cyan-500",
    label: "HANDLED SAFELY",
    sub: "Nova resolved the ticket with no policy violation.",
    Icon: CheckCircle2,
  },
};

export default function VerdictHero({ outcome, running, defense }) {
  if (running) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 p-6 text-white shadow-xl">
        <div className="relative flex items-center gap-4">
          <Loader2 className="h-9 w-9 animate-spin" />
          <div>
            <div className="text-2xl font-bold tracking-tight">Nova is working the ticket…</div>
            <div className="text-sm text-white/80">Watch each tool call clear or get stopped in real time.</div>
          </div>
          <span className="ml-auto rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Defense {defense ? "ON" : "OFF"}</span>
        </div>
      </div>
    );
  }

  if (!outcome) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 text-slate-700 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Crosshair className="h-9 w-9 text-sky-600" />
          <div>
            <div className="text-xl font-bold tracking-tight text-slate-900">Ready to fire</div>
            <div className="text-sm text-slate-500">Pick a ticket, choose whether Riposte is defending, and run it.</div>
          </div>
          <span className="ml-auto rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700">Defense {defense ? "ON" : "OFF"}</span>
        </div>
      </div>
    );
  }

  const v = MAP[outcome] || MAP.safe;
  const Icon = v.Icon;
  return (
    <motion.div
      key={outcome}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl", v.grad)}
    >
      {v.meteors && <Meteors number={16} />}
      <div className="relative flex items-center gap-4">
        <Icon className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <div className="text-2xl font-bold tracking-tight">{v.label}</div>
          <div className="text-sm text-white/85">{v.sub}</div>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Defense {defense ? "ON" : "OFF"}</span>
      </div>
    </motion.div>
  );
}
