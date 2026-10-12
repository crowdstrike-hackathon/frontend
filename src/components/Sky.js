import React from "react";
import { cn } from "../lib/utils";
import { GlowingEffect } from "../ui/aceternity";

// Clear glass for text that sits straight on the sky (white text).
export const CLEAR_GLASS =
  "rounded-3xl border border-white/30 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_40px_rgba(8,30,66,0.18)] backdrop-blur-xl";

// Frosted glass for dense, dark-on-light content.
export const FROSTED_GLASS =
  "rounded-3xl border border-white/60 bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_40px_rgba(8,30,66,0.16)] backdrop-blur-2xl";

// Still sky with soft cloud banks: the in-app backdrop. The animated shader stays on the landing page.
export function SkyBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#1b4a8a_0%,#3a79ba_36%,#86b8e3_74%,#cfe4f5_100%)]">
      <div className="absolute -left-40 top-[26%] h-56 w-[46rem] rounded-full bg-white/45 blur-3xl" />
      <div className="absolute -right-32 top-[48%] h-52 w-[40rem] rounded-full bg-white/40 blur-3xl" />
      <div className="absolute left-[18%] top-[8%] h-28 w-[26rem] rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -bottom-28 left-[12%] h-72 w-[64rem] rounded-full bg-white/70 blur-3xl" />
      <div className="absolute -bottom-20 right-[4%] h-56 w-[34rem] rounded-full bg-white/60 blur-3xl" />
    </div>
  );
}

export function Panel({ title, icon, right, children, className }) {
  return (
    <section className={cn(FROSTED_GLASS, "relative flex min-h-0 flex-col", className)}>
      <GlowingEffect disabled={false} glow proximity={72} spread={34} borderWidth={2} />
      <header className="relative flex items-center gap-2.5 px-5 pb-3 pt-4">
        {icon}
        <h2 className="whitespace-nowrap text-sm font-semibold text-slate-900">{title}</h2>
        {right && <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">{right}</div>}
      </header>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-3xl">{children}</div>
    </section>
  );
}

export function Empty({ icon: Icon, children }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center text-sm text-slate-500">
      {Icon && <Icon className="h-7 w-7 text-sky-600/50" />}
      <p className="max-w-xs">{children}</p>
    </div>
  );
}

export function Chip({ className, children }) {
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium", className)}>{children}</span>;
}
