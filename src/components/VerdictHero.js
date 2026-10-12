import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, CheckCircle2, Loader2, Crosshair } from "lucide-react";
import { cn } from "../lib/utils";

const MAP = {
  exfiltrated: {
    box: "border-rose-500/30 bg-rose-500/[0.08]",
    tone: "text-rose-300",
    label: "Credentials exfiltrated",
    sub: "Nova followed the instructions hidden in the ticket and sent a production secret to the attacker.",
    Icon: ShieldAlert,
  },
  blocked: {
    box: "border-emerald-500/30 bg-emerald-500/[0.08]",
    tone: "text-emerald-300",
    label: "Attack blocked",
    sub: "Riposte caught the injection and stopped the tool call before anything left the environment.",
    Icon: ShieldCheck,
  },
  safe: {
    box: "border-sky-500/30 bg-sky-500/[0.08]",
    tone: "text-sky-300",
    label: "Handled safely",
    sub: "Nova resolved the ticket with no policy violation.",
    Icon: CheckCircle2,
  },
  running: {
    box: "border-white/[0.08] bg-white/[0.025]",
    tone: "text-slate-100",
    label: "Nova is working the ticket",
    sub: "Each tool call is checked as it happens.",
    Icon: Loader2,
    spin: true,
  },
  idle: {
    box: "border-white/[0.08] bg-white/[0.025]",
    tone: "text-slate-100",
    label: "Ready",
    sub: "Pick a ticket, set the shield, and run it.",
    Icon: Crosshair,
  },
};

export default function VerdictHero({ outcome, running, defense }) {
  const key = running ? "running" : outcome || "idle";
  const v = MAP[key] || MAP.safe;
  const Icon = v.Icon;
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-center gap-4 rounded-2xl border px-5 py-4", v.box)}
    >
      <Icon className={cn("h-6 w-6 shrink-0", v.tone, v.spin && "animate-spin")} />
      <div className="min-w-0">
        <div className={cn("text-base font-semibold", v.tone)}>{v.label}</div>
        <div className="text-[13px] text-slate-400">{v.sub}</div>
      </div>
      <span className="ml-auto shrink-0 rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-slate-300">
        Shield {defense ? "on" : "off"}
      </span>
    </motion.div>
  );
}
