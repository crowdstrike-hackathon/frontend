import React from "react";
import { cn } from "../../lib/utils";

export function BentoGrid({ className, children }) {
  return (
    <div className={cn("grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 md:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export function BentoGridItem({ className, header, title, description, icon, children }) {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between overflow-hidden rounded-2xl border-hair glass p-4 transition duration-200 hover:shadow-glow",
        className
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-1">
        {icon}
        {title && <div className="mt-2 mb-1 font-semibold text-slate-100">{title}</div>}
        {description && <div className="text-xs font-normal text-slate-400">{description}</div>}
        {children}
      </div>
    </div>
  );
}
