import React from "react";
import { cn } from "../lib/utils";

export const SURFACE = "rounded-2xl border border-white/[0.08] bg-white/[0.025]";
export const CLEAR_GLASS = SURFACE;
export const FROSTED_GLASS = SURFACE;

export const BTN_PRIMARY =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-slate-200 disabled:opacity-50";
export const BTN_SECONDARY =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] disabled:opacity-50";
export const INPUT =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-white/30 disabled:opacity-60";

export function SkyBackdrop() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#0a0e14]" />;
}

export function Page({ children, className }) {
  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className={cn("mx-auto flex min-h-full w-full max-w-6xl flex-col gap-5 px-6 pb-10 pt-8 lg:px-10", className)}>{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>}
      </div>
      {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Segmented({ value, onChange, options, disabled }) {
  return (
    <div className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={String(o.value)}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex h-full items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition disabled:opacity-60",
              active ? o.activeClass || "bg-white/[0.12] text-white" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />} {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Panel({ title, icon, right, children, className }) {
  return (
    <section className={cn(SURFACE, "relative flex min-h-0 flex-col", className)}>
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-white/[0.06] px-4">
        {icon}
        <h2 className="whitespace-nowrap text-[13px] font-medium text-slate-200">{title}</h2>
        {right && <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">{right}</div>}
      </header>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-2xl">{children}</div>
    </section>
  );
}

export function Empty({ icon: Icon, children }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center text-sm text-slate-500">
      {Icon && <Icon className="h-6 w-6 text-slate-600" />}
      <p className="max-w-xs">{children}</p>
    </div>
  );
}

export function Chip({ className, children }) {
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium", className)}>{children}</span>;
}
