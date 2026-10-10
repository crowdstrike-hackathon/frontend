import React from "react";
import { cn } from "../lib/utils";
import { CardSpotlight, GlowingEffect } from "../ui/aceternity";

export default function Panel({ title, icon, right, children, className, bodyClassName, dots = true }) {
  return (
    <CardSpotlight className={cn("relative flex min-h-0 flex-col", className)} dots={dots}>
      <GlowingEffect />
      {(title || icon) && (
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
          {icon}
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
        </div>
      )}
      <div className={cn("relative flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
    </CardSpotlight>
  );
}
