import React, { useEffect, useState } from "react";
import { AtSign, Ban, Check, ChevronDown, CircleDollarSign, FileText, Hand, KeyRound, Mail, MessageSquareReply, Search, UserRound, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SOURCE } from "../../lib/chat";
import { cn } from "../../lib/utils";

const TOOL_ICON = {
  read_ticket: FileText,
  search_kb: Search,
  get_customer: UserRound,
  create_login_link: KeyRound,
  change_contact_email: AtSign,
  issue_refund: CircleDollarSign,
  send_email: Mail,
  reply: MessageSquareReply,
};

function DecisionBadge({ item }) {
  const action = item.decision?.action || "allow";
  if (action === "block") return <Badge variant="block"><Ban /> Blocked</Badge>;
  if (action === "hold") {
    const status = item.hold?.status;
    if (status === "approved") return <Badge variant="allow"><Check /> Approved</Badge>;
    if (status === "denied") return <Badge variant="block"><X /> {item.hold.expired ? "Timed out" : "Denied"}</Badge>;
    return <Badge variant="hold"><Hand /> Needs approval</Badge>;
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
    <dl className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1.5 font-mono text-[12px] leading-[18px]">
      {names.map((name) => (
        <React.Fragment key={name}>
          <dt className="text-ink-4">{name}</dt>
          <dd className="whitespace-pre-wrap break-words text-ink">{String(item.args[name])}</dd>
          <span>{item.checked && <Provenance evidence={evidence[name]} />}</span>
        </React.Fragment>
      ))}
    </dl>
  );
}

function Verdict({ item, onDecide, busy }) {
  const decision = item.decision;
  if (!decision || decision.action === "allow") return null;
  const hold = decision.action === "hold";
  const pending = hold && item.hold?.status === "pending";
  const Icon = hold ? Hand : Ban;
  return (
    <Alert variant={hold ? "warning" : "destructive"}>
      <Icon />
      <AlertTitle>{decision.title}</AlertTitle>
      <AlertDescription>
        <p>{decision.reason}</p>
        {pending && (
          <div className="mt-1.5 flex gap-2">
            <Button size="sm" variant="dark" disabled={busy} onClick={() => onDecide(item.hold.id, "approve")}>
              <Check /> Approve
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onDecide(item.hold.id, "deny")}>
              <X /> Deny
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// The tool result as returned. When this is the email the agent read and the cause finder pinned the
// sentence that led to a flagged action, that sentence (and only that) is marked red in place.
function Result({ item, cause }) {
  const result = item.result;
  if (!result || result.blocked || result.denied) return null;
  const text = String(result.text || "");
  let content = text;
  const offset = cause?.stable && cause.guilty?.length && cause.body ? text.indexOf(cause.body) : -1;
  if (offset >= 0) {
    content = [];
    let at = 0;
    [...cause.guilty].sort((a, b) => a[0] - b[0]).forEach(([start, end], i) => {
      const from = offset + start;
      const to = offset + end;
      if (from > at) content.push(<span key={`t${i}`}>{text.slice(at, from)}</span>);
      content.push(
        <mark key={`g${i}`} className="rounded-[3px] bg-red-100 px-0.5 text-red-800 ring-1 ring-red-300">{text.slice(from, to)}</mark>,
      );
      at = to;
    });
    if (at < text.length) content.push(<span key="end">{text.slice(at)}</span>);
  }
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-[11.5px] text-ink-3">
        {result.ok ? "Returned" : "Tool error"}
        {result.label === "untrusted" && <Badge variant="untrusted">untrusted content</Badge>}
      </div>
      <pre className={cn("overflow-auto whitespace-pre-wrap break-words rounded-sm bg-paper-3 px-2.5 py-2 font-mono text-[11.5px] leading-relaxed text-ink-2", offset >= 0 ? "max-h-72" : "max-h-40")}>{content}</pre>
      {offset >= 0 && (
        <p className="mt-1.5 text-[11.5px] text-ink-3">
          The cause finder asked the agent again {cause.tested} times, each time with one sentence removed. Without the{" "}
          {cause.guilty.length === 1 ? "sentence" : "sentences"} in red, it no longer called {cause.tool}.
        </p>
      )}
    </div>
  );
}

export default function StepCard({ item, onDecide, busy, cause }) {
  const Icon = TOOL_ICON[item.tool] || FileText;
  const flagged = (item.decision?.action || "allow") !== "allow";
  const marked = !!(cause?.stable && cause.guilty?.length);
  const [open, setOpen] = useState(flagged || marked);

  useEffect(() => {
    if (flagged || marked) setOpen(true);
  }, [flagged, marked]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none">
        <Icon className="h-3.5 w-3.5 shrink-0 text-ink-3" />
        <span className="shrink-0 font-mono text-[12.5px] font-medium text-ink">{item.tool}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-ink-3">{item.thought}</span>
        <span className="shrink-0"><DecisionBadge item={item} /></span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-ink-4 transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 px-3 pb-3 pl-[34px] pt-1">
          <Args item={item} />
          <Verdict item={item} onDecide={onDecide} busy={busy} />
          <Result item={item} cause={cause} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
