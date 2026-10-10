import React from "react";
import { motion } from "framer-motion";
import { Swords, ShieldCheck } from "lucide-react";

export default function DuelBeam({ active = true }) {
  return (
    <div className="relative flex items-center justify-between gap-4 px-2">
      <Node color="red" icon={<Swords className="h-5 w-5" />} label="RED AI" sub="Adversary" />
      <div className="relative mx-2 flex-1">
        <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-red/60 via-slate-600/40 to-azure/60" />
        {active && (
          <>
            <motion.span
              className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red shadow-glow"
              animate={{ left: ["2%", "96%"], opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-azure shadow-glow-blue"
              animate={{ left: ["96%", "2%"], opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
            />
          </>
        )}
      </div>
      <Node color="azure" icon={<ShieldCheck className="h-5 w-5" />} label="BLUE AI" sub="Defender" align="right" />
    </div>
  );
}

function Node({ color, icon, label, sub, align = "left" }) {
  const ring = color === "red" ? "ring-red/40 text-red" : "ring-azure/40 text-azure";
  return (
    <div className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ${ring} animate-pulseGlow`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold tracking-wider text-slate-200">{label}</div>
        <div className="text-[11px] text-slate-500">{sub}</div>
      </div>
    </div>
  );
}
