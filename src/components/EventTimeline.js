import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Fingerprint, Monitor, Wifi, Cloud, Mail, Radio, CloudOff } from "lucide-react";
import { Panel, Empty, Chip } from "./Sky";
import { cn, SEVERITY_COLOR } from "../lib/utils";

const ICONS = { auth: Key, identity: Fingerprint, endpoint: Monitor, network: Wifi, cloud: Cloud, email: Mail };

export default function EventTimeline({ events, narrative, trusted, suspected, running }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [events.length]);

  return (
    <Panel
      className="h-full"
      icon={<Radio className="h-4 w-4 text-slate-500" />}
      title="Live telemetry"
      right={
        <>
          {running && (
            <Chip className="bg-rose-500/10 text-rose-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" /> streaming
            </Chip>
          )}
          <span className="tabular-nums">{events.length} events</span>
        </>
      }
    >
      <AnimatePresence initial={false}>
        {narrative && (
          <motion.div
            key={narrative}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-2 flex items-start gap-2 mt-3 rounded-lg bg-rose-500/10 px-4 py-2.5 text-[13px] leading-relaxed text-rose-300"
          >
            <span className="shrink-0 whitespace-nowrap font-semibold">Red move</span>
            <span>{narrative}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {events.length === 0 ? (
        <Empty icon={CloudOff}>Launch a scenario and the logs will stream in here.</Empty>
      ) : (
        <ul ref={scrollRef} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-2">
          <AnimatePresence initial={false}>
            {events.map((e) => {
              const Icon = ICONS[e.domain] || Monitor;
              const isTrusted = trusted.has(e.id);
              const isSuspect = suspected.has(e.id);
              const color = SEVERITY_COLOR[e.severity] || SEVERITY_COLOR.info;
              return (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-3 border-t border-white/[0.06] px-4 py-3 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}1f`, color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                      <span className="font-semibold uppercase tracking-wide" style={{ color }}>{e.severity}</span>
                      <span className="uppercase tracking-wide text-slate-400">{e.domain}</span>
                      {e.attack_id && e.attack_id !== "DECEPTION" && <span className="font-mono text-slate-400">{e.attack_id}</span>}
                      {isTrusted && <Chip className="ml-auto bg-sky-500/10 py-0.5 text-sky-300">trusted by blue</Chip>}
                      {isSuspect && <Chip className="ml-auto bg-amber-500/15 py-0.5 text-amber-300">flagged as decoy</Chip>}
                    </div>
                    <p className={cn("mt-0.5 text-sm leading-snug", isSuspect ? "text-slate-400" : "text-slate-100")}>{e.message}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{[e.source, e.actor, e.host].filter(Boolean).join(" · ")}</p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </Panel>
  );
}
