import React from "react";
import { Crosshair, Play, StepForward, FastForward, Building2, Crown, Loader2 } from "lucide-react";
import Panel from "./Panel";
import { MovingBorderButton, HoverBorderGradient } from "../ui/aceternity";

export default function ScenarioPicker({ meta, scenarios, selected, onSelect, started, busy, running, onLaunch, onStep, onRun, turn, maxTurns }) {
  return (
    <Panel
      icon={<Crosshair className="h-4 w-4 text-red" />}
      title="Attack scenario"
      right={started ? <span className="font-mono text-xs text-slate-400">{turn}/{maxTurns}</span> : null}
    >
      <div className="px-5 py-4">
        <div className="space-y-2.5">
          {scenarios.map((s) => {
            const active = selected === s.id;
            return (
              <button
                key={s.id}
                disabled={started}
                onClick={() => onSelect(s.id)}
                className={`w-full rounded-xl border p-3 text-left transition disabled:cursor-default ${active ? "border-red/50 bg-red/5 ring-1 ring-red/30" : "border-white/5 bg-white/[0.02] hover:border-white/15"}`}
              >
                <div className="text-[13px] font-semibold text-slate-100">{s.name}</div>
                <div className="mt-1 text-[12px] leading-snug text-slate-400">{s.description}</div>
                <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-red/70">{s.stages} stages · MITRE ATT&CK</div>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {!started ? (
            <MovingBorderButton onClick={onLaunch} disabled={!selected || busy} containerClassName="w-full" className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-4 w-4" /> Launch simulation</>}
            </MovingBorderButton>
          ) : (
            <div className="flex gap-2">
              <HoverBorderGradient as="button" onClick={onStep} disabled={busy || running} containerClassName="flex-1 rounded-xl" className="w-full justify-center rounded-xl">
                <span className="flex items-center justify-center gap-2"><StepForward className="h-4 w-4" /> Step</span>
              </HoverBorderGradient>
              <HoverBorderGradient as="button" onClick={onRun} disabled={busy || running} containerClassName="flex-1 rounded-xl" className="w-full justify-center rounded-xl">
                <span className="flex items-center justify-center gap-2"><FastForward className="h-4 w-4 text-azure" /> Auto-run</span>
              </HoverBorderGradient>
            </div>
          )}
        </div>

        {meta && (
          <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Building2 className="h-3.5 w-3.5 text-azure" /> {meta.environment.company}
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{meta.environment.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {meta.environment.crown_jewels.map((c) => (
                <span key={c} className="flex items-center gap-1 rounded-md bg-amber/10 px-1.5 py-0.5 text-[10px] text-amber ring-1 ring-amber/20">
                  <Crown className="h-2.5 w-2.5" /> {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
