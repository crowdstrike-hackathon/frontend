import React from "react";
import { CircleAlert, Filter, Info, RotateCcw } from "lucide-react";
import { LogoMark } from "../../ui/Logo";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Bubble, BubbleContent } from "../ui/bubble";
import { Button } from "../ui/button";
import { Marker, MarkerContent, MarkerIcon } from "../ui/marker";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "../ui/message";
import { Spinner } from "../ui/spinner";
import StepCard from "./StepCard";
import { MODE_LABEL, OUTCOME, TONE, isLive, verdictNote } from "../../lib/run";
import { cn } from "../../lib/utils";

function Ticket({ ticket }) {
  return (
    <Message align="end">
      <MessageContent>
        <MessageHeader className="font-mono text-[11px] font-normal">
          <span>{ticket.id}</span>
          <span>{ticket.from}</span>
          <span>{ticket.customer_id || "no account"}</span>
        </MessageHeader>
        <Bubble align="end">
          <BubbleContent className="text-[14.5px]">
            <div className="font-semibold">{ticket.subject}</div>
            <p className="mt-0.5 whitespace-pre-wrap text-sky-50">{ticket.body}</p>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

function FilterRow({ item }) {
  const hit = item.hits.length > 0;
  return (
    <div className="px-3 py-2">
      <Marker>
        <MarkerIcon><Filter className={cn("!size-3.5", hit ? "text-amber-600" : "text-ink-3")} /></MarkerIcon>
        <span className="shrink-0 font-mono text-[12.5px] font-medium text-ink">keyword_filter</span>
        <MarkerContent className="flex-1 truncate">
          {hit ? "The ticket was quarantined before the agent saw it" : "No known injection phrase in the ticket, so nothing else is checked"}
        </MarkerContent>
        <Badge variant={hit ? "hold" : "muted"}>{hit ? "Matched" : "no match"}</Badge>
      </Marker>
      {hit && (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-[26px]">
          {item.hits.map((h, i) => (
            <code key={i} className="rounded bg-amber-100 px-1.5 py-px font-mono text-[11.5px] text-amber-900">{h}</code>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteRow({ item }) {
  const error = item.kind === "error";
  const Icon = error ? CircleAlert : Info;
  return (
    <Marker className={cn("items-start px-3 py-2", error && "text-red-700")}>
      <MarkerIcon className="mt-0.5"><Icon className="!size-3.5" /></MarkerIcon>
      <MarkerContent>{item.text}</MarkerContent>
    </Marker>
  );
}

function Outcome({ run, onRerun, canRerun }) {
  const meta = OUTCOME[run.outcome] || OUTCOME.error;
  const tone = TONE[meta.tone];
  const Icon = meta.icon;
  const note = verdictNote(run);
  const others = ["off", "keyword", "riposte"].filter((m) => m !== run.mode);
  return (
    <Alert variant={tone.alert}>
      <Icon />
      <AlertTitle>{meta.label}</AlertTitle>
      <AlertDescription>
        <p>{run.summary}{note ? ` ${note}` : ""}</p>
        {canRerun && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-ink-3">Run the same ticket with</span>
            {others.map((m) => (
              <Button key={m} size="sm" variant="outline" onClick={() => onRerun(run.ticket, m)}>
                <RotateCcw /> {MODE_LABEL[m]}
              </Button>
            ))}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default function RunThread({ run, onDecide, deciding, onRerun, canRerun }) {
  const live = isLive(run);
  const thinking = live && run.thinking;
  return (
    <div className="flex flex-col gap-5">
      <Marker variant="separator" className="text-[11.5px]">
        <MarkerContent>{MODE_LABEL[run.mode]} · <span className="font-mono">{run.model}</span></MarkerContent>
      </Marker>
      <Ticket ticket={run.ticket} />
      <Message>
        <MessageAvatar className="bg-transparent"><LogoMark size={28} /></MessageAvatar>
        <MessageContent>
          <MessageHeader className="h-8">
            <span className="text-[13px] text-ink">Nova</span>
            <span className="font-normal">support agent</span>
          </MessageHeader>
          {(run.items.length > 0 || thinking) && (
            <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
              {run.items.map((item) => {
                if (item.kind === "call") return <StepCard key={item.key} item={item} onDecide={(holdId, d) => onDecide(run.id, holdId, d)} busy={deciding} />;
                if (item.kind === "filter") return <FilterRow key={item.key} item={item} />;
                return <NoteRow key={item.key} item={item} />;
              })}
              {thinking && (
                <Marker className="px-3 py-2">
                  <MarkerIcon><Spinner className="!size-3.5 text-brand" /></MarkerIcon>
                  <MarkerContent>Choosing the next tool call</MarkerContent>
                </Marker>
              )}
            </div>
          )}
          {run.finalReply && (
            <>
              <Bubble variant="muted" className="max-w-[90%]">
                <BubbleContent className="whitespace-pre-wrap text-[14.5px]">{run.finalReply}</BubbleContent>
              </Bubble>
              <MessageFooter className="-mt-1.5">Sent to {run.ticket.from}</MessageFooter>
            </>
          )}
          {!live && run.outcome && <Outcome run={run} onRerun={onRerun} canRerun={canRerun} />}
        </MessageContent>
      </Message>
    </div>
  );
}
