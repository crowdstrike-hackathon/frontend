import React from "react";
import { CircleAlert, Filter, Info } from "lucide-react";
import { LogoMark } from "../../ui/Logo";
import { Badge } from "../ui/badge";
import { Bubble, BubbleContent } from "../ui/bubble";
import { Marker, MarkerContent, MarkerIcon } from "../ui/marker";
import { Message, MessageAvatar, MessageContent, MessageHeader } from "../ui/message";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import StepCard from "./StepCard";
import { MODE_LABEL, OUTCOME, TONE, verdictNote } from "../../lib/chat";
import { cn } from "../../lib/utils";

function Mentions({ text, refs }) {
  const byToken = Object.fromEntries(refs.map((r) => [r.token.toLowerCase(), r]));
  return text.split(/(@[A-Za-z0-9][A-Za-z0-9_-]*)/g).map((part, i) => {
    const ref = byToken[part.toLowerCase()];
    if (!ref) return <React.Fragment key={i}>{part}</React.Fragment>;
    return (
      <Tooltip key={i}>
        <TooltipTrigger asChild>
          <span className="cursor-help rounded-sm bg-white/15 px-1 py-px font-mono text-[0.9em]">{part}</span>
        </TooltipTrigger>
        <TooltipContent>{ref.kind === "ticket" ? "Ticket" : "Customer"}: {ref.label}</TooltipContent>
      </Tooltip>
    );
  });
}

function FilterRow({ item }) {
  const hit = item.hits.length > 0;
  return (
    <div className="px-3 py-2">
      <Marker>
        <MarkerIcon><Filter className={cn("!size-3.5", hit ? "text-amber-600" : "text-ink-3")} /></MarkerIcon>
        <span className="shrink-0 font-mono text-[12.5px] font-medium text-ink">keyword_filter</span>
        <MarkerContent className="flex-1 truncate">
          {hit ? "The ticket was quarantined before the agent could use it" : "No known injection phrase in the ticket, so nothing else is checked"}
        </MarkerContent>
        <Badge variant={hit ? "hold" : "muted"}>{hit ? "Matched" : "no match"}</Badge>
      </Marker>
      {hit && (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-[26px]">
          {item.hits.map((h, i) => (
            <code key={i} className="rounded-sm border border-line px-1.5 py-px font-mono text-[11.5px] text-amber-800">{h}</code>
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

function Outcome({ turn, mode }) {
  const meta = OUTCOME[turn.outcome] || OUTCOME.error;
  const tone = TONE[meta.tone];
  const Icon = meta.icon;
  const note = verdictNote(turn, mode);
  return (
    <div className="flex flex-col gap-1.5 pt-0.5 text-[13px] leading-relaxed">
      <p className="flex items-start gap-2 text-ink-2">
        <Icon className={cn("mt-[3px] h-4 w-4 shrink-0", tone.text)} />
        <span>
          <span className={cn("font-semibold", tone.text)}>{meta.label}.</span> {turn.summary}{note ? ` ${note}` : ""}
        </span>
      </p>
    </div>
  );
}

function Turn({ turn, chat, onDecide, deciding }) {
  const done = turn.status !== "running";
  const thinking = !done && turn.thinking;
  const showOutcome = done && turn.outcome && (turn.acted || ["error", "cancelled", "interrupted"].includes(turn.outcome));
  return (
    <>
      <Message align="end">
        <MessageContent>
          <Bubble align="end">
            <BubbleContent className="whitespace-pre-wrap text-[14px]">
              <Mentions text={turn.message} refs={turn.refs} />
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar className="bg-transparent"><LogoMark size={28} /></MessageAvatar>
        <MessageContent>
          <MessageHeader className="h-8">
            <span className="text-[13px] text-ink">Nova</span>
            <span className="font-normal">Northwind's support agent</span>
          </MessageHeader>
          {(turn.items.length > 0 || thinking) && (
            <div className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white/60">
              {turn.items.map((item) => {
                if (item.kind === "call") return <StepCard key={item.key} item={item} onDecide={(holdId, d) => onDecide(chat.id, holdId, d)} busy={deciding} />;
                if (item.kind === "filter") return <FilterRow key={item.key} item={item} />;
                return <NoteRow key={item.key} item={item} />;
              })}
              {thinking && (
                <Marker className="px-3 py-2">
                  <MarkerIcon><Spinner className="!size-3.5 text-brand" /></MarkerIcon>
                  <MarkerContent>{turn.items.length ? "Working on the next step" : "Thinking"}</MarkerContent>
                </Marker>
              )}
            </div>
          )}
          {turn.answer && (
            <Bubble variant="ghost">
              <BubbleContent className="max-w-[68ch] whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">{turn.answer}</BubbleContent>
            </Bubble>
          )}
          {showOutcome && <Outcome turn={turn} mode={chat.mode} />}
        </MessageContent>
      </Message>
    </>
  );
}

export default function ChatThread({ chat, onDecide, deciding }) {
  return (
    <div className="flex flex-col gap-5">
      <Marker variant="separator" className="text-[11.5px]">
        <MarkerContent>{MODE_LABEL[chat.mode]} · <span className="font-mono">{chat.model}</span></MarkerContent>
      </Marker>
      {chat.turns.map((turn) => (
        <Turn key={turn.index} turn={turn} chat={chat} onDecide={onDecide} deciding={deciding} />
      ))}
    </div>
  );
}
