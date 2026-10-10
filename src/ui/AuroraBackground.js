import React from "react";
import { cn } from "../lib/utils";

export default function AuroraBackground({ className, children }) {
  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-ink-950", className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-red/20 blur-[140px] animate-float" />
        <div className="absolute right-[-10rem] top-10 h-[38rem] w-[38rem] rounded-full bg-azure/20 blur-[150px] animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-[-14rem] left-1/3 h-[40rem] w-[40rem] rounded-full bg-indigo-500/10 blur-[150px] animate-float" style={{ animationDelay: "3s" }} />
      </div>
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
