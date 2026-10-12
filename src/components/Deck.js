import React from "react";
import { motion } from "framer-motion";
import { Play, StepForward, FastForward, Loader2, Crown } from "lucide-react";
import { NumberTicker } from "../ui/aceternity";
import { CLEAR_GLASS, Chip } from "./Sky";
import { cn } from "../lib/utils";

const PRIMARY = "flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-slate-200 disabled:opacity-50";
const SECONDARY = "flex h-9 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] disabled:opacity-50";

// The strip across the top of the dashboard: what is being attacked, how far along it is, and who is winning.
export default function Deck({ meta, scenarios, selected, onSelect, started, busy, running, onLaunch, onStep, onRun, turn, score }) {
  const current = scenarios.find((s) => s.id === selected);
  const maxTurns = current?.stages || 0;
  const live = meta?.mode === "live";

  return (
    <section className={cn(CLEAR_GLASS, "grid shrink-0 gap-6 p-5 text-white lg:grid-cols-[minmax(0,1fr)_320px] lg:p-6")}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/75">
          <span>{started ? `Turn ${turn} of ${maxTurns}` : "New engagement"}</span>
          {meta && (
            <Chip className="bg-white/15 normal-case tracking-normal text-white">
              <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-emerald-300" : "bg-amber-300")} />
              {live ? "Live models" : "Mock models"}
            </Chip>
          )}
          {meta && (
            <span className="font-mono normal-case tracking-normal text-white/65">
              red {meta.red.model} · blue {meta.blue.model}
            </span>
          )}
        </div>

        {!started ? (
          <>
            <h1 className="mt-2 text-[22px] font-semibold tracking-tight">Choose a scenario</h1>
            <div role="radiogroup" aria-label="Attack scenario" className="mt-4 grid gap-3 md:grid-cols-3">
              {scenarios.map((s) => {
                const active = selected === s.id;
                return (
                  <button
                    key={s.id}
                    role="radio"
                    aria-checked={active}
                    onClick={() => onSelect(s.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition",
                      active ? "border-white/40 bg-white/[0.08] text-white" : "border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className={cn("mt-1 line-clamp-2 text-xs leading-relaxed", active ? "text-slate-300" : "text-slate-500")}>{s.description}</div>
                    <div className={cn("mt-2 font-mono text-[10px] uppercase tracking-wide", active ? "text-sky-300" : "text-slate-600")}>{s.stages} stages · MITRE ATT&CK</div>
                  </button>
                );
              })}
              {scenarios.length === 0 && <p className="text-sm text-white/75">No scenarios loaded. Is the backend running?</p>}
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight">{current?.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/80">{current?.description}</p>
            <div className="mt-4 flex max-w-2xl gap-1.5" role="img" aria-label={`Turn ${turn} of ${maxTurns}`}>
              {Array.from({ length: maxTurns }).map((_, i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i < turn ? "bg-white" : "bg-white/25")} />
              ))}
            </div>
          </>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!started ? (
            <button className={PRIMARY} onClick={onLaunch} disabled={!selected || busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Launch simulation
            </button>
          ) : (
            <>
              <button className={PRIMARY} onClick={onStep} disabled={busy || running}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <StepForward className="h-4 w-4" />} Next turn
              </button>
              <button className={SECONDARY} onClick={onRun} disabled={busy || running}>
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <FastForward className="h-4 w-4" />} {running ? "Running" : "Auto-run"}
              </button>
            </>
          )}
        </div>
      </div>

      <aside className="min-w-0 border-t border-white/[0.08] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        {score ? <Score score={score} /> : meta ? <Target env={meta.environment} /> : null}
      </aside>
    </section>
  );
}

function Target({ env }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/75">Target</div>
      <div className="mt-2 text-lg font-semibold">{env.company}</div>
      <p className="mt-1 text-xs leading-relaxed text-white/80">{env.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {env.crown_jewels.map((c) => (
          <Chip key={c} className="bg-white/15 font-mono text-white">
            <Crown className="h-3 w-3 text-amber-200" /> {c}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Score({ score }) {
  const total = score.blue_points + score.red_points;
  const bluePct = total > 0 ? (score.blue_points / total) * 100 : 50;
  const stats = [
    { label: score.detected ? `Detected on turn ${score.detection_turn}` : "Not detected yet", good: score.detected },
    { label: `Decoys caught ${score.decoys_flagged_correct}/${score.decoy_events}`, good: score.decoy_events === 0 || score.decoys_missed === 0 },
    { label: score.false_positive ? "False positive" : "No false positives", good: !score.false_positive },
  ];
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-sky-100">Blue</div>
          <div className="text-5xl font-semibold tabular-nums leading-none"><NumberTicker value={score.blue_points} /></div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-rose-200">Red</div>
          <div className="text-5xl font-semibold tabular-nums leading-none"><NumberTicker value={score.red_points} /></div>
        </div>
      </div>
      <div className="mt-4 flex h-2 gap-1">
        <motion.div initial={{ width: "50%" }} animate={{ width: `${bluePct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} className="rounded-full bg-sky-400" />
        <div className="flex-1 rounded-full bg-rose-400" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {stats.map((s) => (
          <Chip key={s.label} className="bg-white/15 text-white">
            <span className={cn("h-1.5 w-1.5 rounded-full", s.good ? "bg-emerald-300" : "bg-rose-300")} /> {s.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
