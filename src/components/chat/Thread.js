import React from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import StepCard from "./StepCard";
import { MODE_LABEL, OUTCOME, TONE, isLive, verdictNote } from "../../lib/run";
import { cn } from "../../lib/utils";

function TicketBubble({ ticket }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl bg-paper-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-ink-3">
          <span>{ticket.id}</span>
          <span>{ticket.from}</span>
          <span>{ticket.customer_id || "no account"}</span>
        </div>
        <div className="mt-1.5 text-[15px] font-semibold text-ink">{ticket.subject}</div>
        <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-2">{ticket.body}</p>
      </div>
    </div>
  );
}

function FilterCard({ item }) {
  const hit = item.hits.length > 0;
  return (
    <div className={cn("rounded-lg border bg-white px-3 py-2 text-[13px]", hit ? "border-amber-600/40 border-l-2 border-l-amber-600" : "border-line")}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[12.5px] font-medium text-ink">keyword_filter</span>
        <Badge variant={hit ? "hold" : "muted"} className="ml-auto">{hit ? "Matched" : "no match"}</Badge>
      </div>
      <p className="mt-1 leading-relaxed text-ink-2">
        {hit ? (
          <>The ticket text contains {item.hits.map((h, i) => <code key={i} className="mx-0.5 rounded bg-amber-100 px-1 py-px font-mono text-[11.5px] text-amber-900">{h}</code>)}. The ticket was quarantined.</>
        ) : (
          "None of the known injection phrases appear in the ticket, so the agent continues with no further checks."
        )}
      </p>
    </div>
  );
}

function Note({ item }) {
  const error = item.kind === "error";
  return <p className={cn("border-l-2 pl-3 text-[13px] leading-relaxed", error ? "border-red-700 text-red-800" : "border-line-strong text-ink-3")}>{item.text}</p>;
}

function Outcome({ run, onRerun, canRerun }) {
  const meta = OUTCOME[run.outcome] || OUTCOME.error;
  const tone = TONE[meta.tone];
  const Icon = meta.icon;
  const note = verdictNote(run);
  const others = ["off", "keyword", "riposte"].filter((m) => m !== run.mode);
  return (
    <div className={cn("mt-1 rounded-lg border border-l-2 border-line bg-white px-3.5 py-3", tone.bar)}>
      <div className={cn("flex items-center gap-2 text-[14px] font-semibold", tone.text)}>
        <Icon className="h-4 w-4" /> {meta.label}
        <span className="font-normal text-ink-3">· {MODE_LABEL[run.mode]}</span>
      </div>
      <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{run.summary}</p>
      {note && <p className="mt-0.5 text-[13px] leading-relaxed text-ink-3">{note}</p>}
      {canRerun && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-ink-3">Run the same ticket with</span>
          {others.map((m) => (
            <Button key={m} size="sm" variant="outline" onClick={() => onRerun(run.ticket, m)}>
              <RotateCcw /> {MODE_LABEL[m]}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RunThread({ run, onDecide, deciding, onRerun, canRerun }) {
  const live = isLive(run);
  return (
    <div className="flex flex-col gap-4">
      <TicketBubble ticket={run.ticket} />
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center gap-2 text-[12px] text-ink-3">
          <span className="font-medium text-ink-2">Nova</span>
          <span className="font-mono text-[11px]">{run.model}</span>
          <span className="text-ink-4">/</span>
          <span>{MODE_LABEL[run.mode]}</span>
        </div>
        {run.items.map((item) => {
          if (item.kind === "call") return <StepCard key={item.key} item={item} onDecide={(holdId, d) => onDecide(run.id, holdId, d)} busy={deciding} />;
          if (item.kind === "filter") return <FilterCard key={item.key} item={item} />;
          return <Note key={item.key} item={item} />;
        })}
        {live && run.thinking && (
          <div className="flex items-center gap-2 py-1 text-[13px] text-ink-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-clay" /> Choosing the next tool call
          </div>
        )}
        {run.finalReply && (
          <div className="pt-2">
            <div className="text-[12px] text-ink-3">Reply sent to {run.ticket.from}</div>
            <p className="mt-1 whitespace-pre-wrap break-words font-serif text-[16px] leading-[1.65] text-ink">{run.finalReply}</p>
          </div>
        )}
        {!live && run.outcome && <Outcome run={run} onRerun={onRerun} canRerun={canRerun} />}
      </div>
    </div>
  );
}
