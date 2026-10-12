import React, { useState } from "react";
import { Ban, Check, ChevronRight, CircleDollarSign, FileText, Hand, KeyRound, Mail, MessageSquareReply, Search, UserRound, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SOURCE } from "../../lib/run";
import { cn } from "../../lib/utils";

const TOOL_ICON = {
  read_ticket: FileText,
  search_kb: Search,
  get_customer: UserRound,
  get_api_key: KeyRound,
  issue_refund: CircleDollarSign,
  send_email: Mail,
  reply: MessageSquareReply,
};

const FRAME = {
  allow: "border-line",
  block: "border-red-700/30 border-l-2 border-l-red-700",
  hold: "border-amber-600/40 border-l-2 border-l-amber-600",
};

function DecisionBadge({ item }) {
  const action = item.decision?.action || "allow";
  if (action === "block") return <Badge variant="block"><Ban /> Blocked</Badge>;
  if (action === "hold") {
    const status = item.hold?.status;
    if (status === "approved") return <Badge variant="allow"><Check /> Approved by a person</Badge>;
    if (status === "denied") return <Badge variant="block"><X /> Denied by a person</Badge>;
    return <Badge variant="hold"><Hand /> Waiting for approval</Badge>;
  }
  if (!item.checked) return <Badge variant="muted">not checked</Badge>;
  return <Badge variant="allow"><Check /> Allowed</Badge>;
}

function Provenance({ evidence }) {
  if (!evidence) return null;
  const meta = SOURCE[evidence.source] || SOURCE.unknown;
  const origin = evidence.origins?.length ? `Found in ${evidence.origins.join(", ")}.` : meta.hint;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span><Badge variant={evidence.source} className="cursor-help">{meta.label}</Badge></span>
      </TooltipTrigger>
      <TooltipContent>{origin}</TooltipContent>
    </Tooltip>
  );
}

function Args({ item }) {
  const names = Object.keys(item.args || {});
  if (!names.length) return null;
  const evidence = Object.fromEntries((item.decision?.evidence || []).map((e) => [e.arg, e]));
  return (
    <dl className="border-t border-line px-3 py-2 font-mono text-[12px] leading-relaxed">
      {names.map((name) => (
        <div key={name} className="flex items-start gap-3 py-0.5">
          <dt className="w-[5.5rem] shrink-0 text-ink-4">{name}</dt>
          <dd className="min-w-0 flex-1 whitespace-pre-wrap break-words text-ink">{String(item.args[name])}</dd>
          {item.checked && <Provenance evidence={evidence[name]} />}
        </div>
      ))}
    </dl>
  );
}

function Verdict({ item, onDecide, busy }) {
  const decision = item.decision;
  if (!decision || decision.action === "allow") return null;
  const hold = decision.action === "hold";
  const pending = hold && item.hold?.status === "pending";
  return (
    <div className={cn("border-t px-3 py-2.5", hold ? "border-amber-600/30 bg-amber-50/60" : "border-red-700/20 bg-red-50/60")}>
      <div className={cn("text-[13px] font-semibold", hold ? "text-amber-800" : "text-red-800")}>{decision.title}</div>
      <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{decision.reason}</p>
      {pending && (
        <div className="mt-2.5 flex gap-2">
          <Button size="sm" variant="dark" disabled={busy} onClick={() => onDecide(item.hold.id, "approve")}>
            <Check /> Approve
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onDecide(item.hold.id, "deny")}>
            <X /> Deny
          </Button>
        </div>
      )}
    </div>
  );
}

function Result({ item }) {
  const [open, setOpen] = useState(false);
  const result = item.result;
  if (!result || result.blocked || result.denied) return null;
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-t border-line">
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[12px] text-ink-3 transition-colors hover:text-ink">
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
        {result.ok ? "Result" : "Tool error"}
        {result.label === "untrusted" && <Badge variant="untrusted" className="ml-1">untrusted content</Badge>}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words border-t border-line bg-paper-2 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-ink-2">{result.text}</pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function StepCard({ item, onDecide, busy }) {
  const Icon = TOOL_ICON[item.tool] || FileText;
  const action = item.decision?.action || "allow";
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-white", FRAME[action])}>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-ink-3" />
        <span className="font-mono text-[12.5px] font-medium text-ink">{item.tool}</span>
        {item.thought && <span className="hidden min-w-0 flex-1 truncate text-[12.5px] text-ink-3 sm:block">{item.thought}</span>}
        <span className="ml-auto shrink-0"><DecisionBadge item={item} /></span>
      </div>
      <Args item={item} />
      <Verdict item={item} onDecide={onDecide} busy={busy} />
      <Result item={item} />
    </div>
  );
}
