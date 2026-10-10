import React from "react";
import { cn } from "../lib/utils";
import { GlowingEffect } from "../ui/aceternity";

export default function Panel({ title, icon, right, children, className, bodyClassName }) {
  return (
    <div className={cn("relative flex min-h-0 flex-col rounded-2xl border border-white/10 bg-ink-900/70 backdrop-blur-xl", className)}>
      <GlowingEffect disabled={false} glow proximity={72} spread={34} borderWidth={2} />
      {(title || icon) && (
        <div className="relative flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
          {icon}
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
        </div>
      )}
      <div className={cn("relative flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
    </div>
  );
}
