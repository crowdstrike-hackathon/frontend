import React from "react";
import { motion } from "framer-motion";
import { CircleAlert, Filter, Info, Loader2, RotateCcw } from "lucide-react";
import { LogoMark } from "../../ui/Logo";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import StepCard from "./StepCard";
import { MODE_LABEL, OUTCOME, TONE, isLive, verdictNote } from "../../lib/run";
import { cn } from "../../lib/utils";

function TicketBubble({ ticket }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
      <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-sky-700 px-4 py-3 text-white shadow-md shadow-sky-900/20">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-sky-100">
          <span className="font-mono">{ticket.id}</span>
          <span>from {ticket.from}</span>
          <span>{ticket.customer_id ? `account ${ticket.customer_id}` : "no account matched"}</span>
        </div>
        <div className="mt-1.5 text-[14px] font-semibold">{ticket.subject}</div>
        <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-sky-50">{ticket.body}</p>
      </div>
    </motion.div>
  );
}

function FilterCard({ item }) {
  const hit = item.hits.length > 0;
  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-[12.5px] shadow-sm", hit ? "border-amber-300 bg-amber-50/80" : "border-slate-200 bg-white")}>
      <div className="flex items-center gap-2 font-semibold text-slate-800">
        <Filter className={cn("h-3.5 w-3.5", hit ? "text-amber-600" : "text-slate-400")} />
        Keyword filter
        <Badge variant={hit ? "hold" : "muted"} className="ml-auto">{hit ? "Matched" : "No match"}</Badge>
      </div>
      <p className="mt-1.5 leading-relaxed text-slate-600">
        {hit ? (
          <>The ticket text contains {item.hits.map((h, i) => <code key={i} className="mx-0.5 rounded bg-amber-100 px-1 py-0.5 font-mono text-[11.5px] text-amber-800">{h}</code>)}. The ticket was quarantined.</>
        ) : (
          "None of the known injection phrases appear in the ticket, so the agent continues with no further checks."
        )}
      </p>
    </div>
  );
}

function Note({ item }) {
  const error = item.kind === "error";
  const Icon = error ? CircleAlert : Info;
  return (
    <div className={cn("flex items-start gap-2 rounded-2xl border px-4 py-2.5 text-[12.5px]", error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600")}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {item.text}
    </div>
  );
}

function OutcomeBanner({ run, onRerun, canRerun }) {
  const meta = OUTCOME[run.outcome] || OUTCOME.error;
  const tone = TONE[meta.tone];
  const Icon = meta.icon;
  const note = verdictNote(run);
  const others = ["off", "keyword", "riposte"].filter((m) => m !== run.mode);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cn("rounded-2xl border px-4 py-3.5 shadow-sm", tone.panel)}>
      <div className="flex items-start gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tone.icon)}><Icon className="h-[18px] w-[18px]" /></span>
        <div className="min-w-0 flex-1">
          <div className={cn("text-[14px] font-semibold", tone.text)}>{meta.label} <span className="font-normal text-slate-500">· {MODE_LABEL[run.mode]}</span></div>
          <p className="mt-0.5 text-[13px] leading-relaxed text-slate-700">{run.summary}</p>
          {note && <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">{note}</p>}
        </div>
      </div>
      {canRerun && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-12">
          <span className="text-[11.5px] text-slate-500">Same ticket with</span>
          {others.map((m) => (
            <Button key={m} size="sm" variant="outline" onClick={() => onRerun(run.ticket, m)}>
              <RotateCcw /> {MODE_LABEL[m]}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function RunThread({ run, onDecide, deciding, onRerun, canRerun }) {
  const live = isLive(run);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {MODE_LABEL[run.mode]} · {run.model}
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <TicketBubble ticket={run.ticket} />
      <div className="flex gap-3">
        <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-sky-200"><LogoMark size={20} /></span>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="text-[12px] font-semibold text-slate-500">Nova · support agent</div>
          {run.items.map((item) => {
            if (item.kind === "call") return <StepCard key={item.key} item={item} onDecide={(holdId, d) => onDecide(run.id, holdId, d)} busy={deciding} />;
            if (item.kind === "filter") return <FilterCard key={item.key} item={item} />;
            return <Note key={item.key} item={item} />;
          })}
          {live && run.thinking && (
            <div className="flex items-center gap-2 py-1 text-[12.5px] text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" /> Nova is choosing the next tool call
            </div>
          )}
          {run.finalReply && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-[92%] rounded-3xl rounded-tl-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-[11px] font-medium text-slate-400">Reply sent to {run.ticket.from}</div>
              <p className="mt-1 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-slate-800">{run.finalReply}</p>
            </motion.div>
          )}
          {!live && run.outcome && <OutcomeBanner run={run} onRerun={onRerun} canRerun={canRerun} />}
        </div>
      </div>
    </div>
  );
}
