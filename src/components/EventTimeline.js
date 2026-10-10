import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Fingerprint, Monitor, Wifi, Cloud, Mail, ShieldAlert, Radio } from "lucide-react";
import Panel from "./Panel";
import { SEVERITY_COLOR } from "../lib/utils";

const ICONS = { auth: Key, identity: Fingerprint, endpoint: Monitor, network: Wifi, cloud: Cloud, email: Mail };

export default function EventTimeline({ events, narrative, trusted, suspected, running }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  return (
    <Panel
      className="flex-1"
      dots={false}
      icon={<Radio className="h-4 w-4 text-rose-600" />}
      title="Live telemetry"
      right={
        <>
          <span className="text-xs text-slate-500">adversary AI emitting logs</span>
          {running && (
            <span className="flex items-center gap-1.5 text-xs text-rose-600">
              <span className="h-2 w-2 animate-ping rounded-full bg-rose-500" /> streaming
            </span>
          )}
        </>
      }
    >
      <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-3">
        <AnimatePresence initial={false}>
          {narrative && (
            <motion.div
              key={narrative}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 font-mono text-xs text-rose-600/90"
            >
              <span className="shrink-0 whitespace-nowrap font-bold">RED ▸</span> {narrative}
            </motion.div>
          )}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center text-sm text-slate-500">
            <ShieldAlert className="mb-3 h-8 w-8 text-slate-300" />
            No telemetry yet. Launch a scenario to begin the engagement.
          </div>
        )}

        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {events.map((e) => {
              const Icon = ICONS[e.domain] || Monitor;
              const isTrusted = trusted.has(e.id);
              const isSuspect = suspected.has(e.id);
              const color = SEVERITY_COLOR[e.severity] || SEVERITY_COLOR.info;
              return (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: isSuspect ? 0.6 : 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="group flex gap-3 rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2.5 transition hover:bg-white"
                  style={{ borderLeft: `2px solid ${isTrusted ? "#0284c7" : "transparent"}` }}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}1a`, color }}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-900/15">
                        {e.domain}
                      </span>
                      {e.attack_id && e.attack_id !== "DECEPTION" && (
                        <span className="font-mono text-[10px] text-rose-600/80">{e.attack_id}</span>
                      )}
                      <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                    </div>
                    <p className="mt-1 text-[13px] leading-snug text-slate-800">{e.message}</p>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <span>{e.source}</span>
                      {e.actor && <span>· {e.actor}</span>}
                      {e.host && <span>· {e.host}</span>}
                      {isSuspect && <span className="ml-auto text-amber-600">⚑ flagged deception</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      </div>
    </Panel>
  );
}
