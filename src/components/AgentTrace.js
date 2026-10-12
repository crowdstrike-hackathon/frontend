import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, KeyRound, Send, Search, ShieldX, CornerDownRight, MessageSquare } from "lucide-react";
import { Panel, Empty, Chip } from "./Sky";
import { cn } from "../lib/utils";

const TOOL_ICON = { get_secret: KeyRound, send_email: Send, http_post: Send, search_kb: Search, get_customer: Search };

function argline(args) {
  return Object.entries(args || {})
    .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(", ");
}

function Prescreen({ d }) {
  return (
    <div className="mx-4 mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
        <Activity className="h-3.5 w-3.5" /> Input firewall · {d.attack_id}
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-amber-200/80">{d.reason}</p>
    </div>
  );
}

export default function AgentTrace({ steps, decisions, finalAnswer, running, className }) {
  const scroller = useRef(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [steps, finalAnswer]);

  const prescreen = (decisions || []).find((d) => d.step_index === 0 && d.allow);
  const toolSteps = (steps || []).filter((s) => s.tool);

  return (
    <Panel
      className={className}
      icon={<Activity className="h-4 w-4 text-slate-500" />}
      title="Nova tool trace"
      right={<span>{toolSteps.length} tool call{toolSteps.length === 1 ? "" : "s"}</span>}
    >
      {toolSteps.length === 0 && !running ? (
        <Empty icon={Activity}>Run a ticket to watch Nova reason and call tools step by step.</Empty>
      ) : (
        <div ref={scroller} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-3">
          {prescreen && <Prescreen d={prescreen} />}
          <ul className="px-4">
            <AnimatePresence initial={false}>
              {toolSteps.map((s) => {
                const Icon = TOOL_ICON[s.tool] || Search;
                return (
                  <motion.li
                    key={s.index}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t border-white/[0.06] py-3.5 first:border-t-0"
                  >
                    {s.thought && <p className="mb-1.5 text-[13px] italic leading-snug text-slate-400">“{s.thought}”</p>}
                    <div
                      className={cn(
                        "rounded-lg border px-3.5 py-2.5",
                        s.blocked ? "border-rose-400/25 bg-rose-400/[0.07]" : "border-white/10 bg-white/[0.03]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", s.blocked ? "text-rose-400" : "text-slate-400")} />
                        <span className="font-mono text-[13px] font-semibold text-slate-100">{s.tool}</span>
                        {s.privileged && <Chip className="bg-amber-500/15 py-0 text-amber-300">privileged</Chip>}
                        {s.egress && <Chip className="bg-sky-500/15 py-0 text-sky-300">egress</Chip>}
                        {s.blocked && <Chip className="ml-auto bg-rose-500/15 py-0 text-rose-300">blocked</Chip>}
                      </div>
                      <p className="mt-1 break-all font-mono text-[11px] text-slate-400">{argline(s.args)}</p>
                      <div className="mt-1.5 flex items-start gap-1.5">
                        <CornerDownRight className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", s.blocked ? "text-rose-400" : "text-emerald-400")} />
                        <p className={cn("break-all text-[12px] leading-relaxed", s.blocked ? "text-rose-300" : "text-slate-400")}>
                          {s.observation}
                        </p>
                      </div>
                      {s.blocked && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-rose-300">
                          <ShieldX className="h-3.5 w-3.5" /> Riposte stopped this call
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          {finalAnswer && (
            <div className="mx-4 mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <MessageSquare className="h-3.5 w-3.5" /> Nova's reply to the customer
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-300">{finalAnswer}</p>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
