import React, { useState } from "react";
import { motion } from "framer-motion";
import { Ban, Check, ChevronRight, CircleCheck, CircleDollarSign, FileText, Hand, KeyRound, Mail, MessageSquareReply, Search, UserRound, X } from "lucide-react";
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
  allow: "border-slate-200 bg-white",
  block: "border-rose-300 bg-rose-50/70",
  hold: "border-amber-300 bg-amber-50/70",
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
  if (!item.checked) return <Badge variant="muted">Not checked</Badge>;
  return <Badge variant="allow"><CircleCheck /> Allowed</Badge>;
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
    <dl className="mt-2.5 space-y-1.5">
      {names.map((name) => (
        <div key={name} className="flex items-start gap-2 text-[12.5px]">
          <dt className="w-[5.5rem] shrink-0 pt-0.5 font-mono text-[11px] text-slate-400">{name}</dt>
          <dd className="min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-slate-800">{String(item.args[name])}</dd>
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
    <div className={cn("mt-3 rounded-xl border px-3.5 py-3", hold ? "border-amber-300 bg-white" : "border-rose-300 bg-white")}>
      <div className={cn("text-[13px] font-semibold", hold ? "text-amber-700" : "text-rose-700")}>{decision.title}</div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{decision.reason}</p>
      {pending && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" disabled={busy} onClick={() => onDecide(item.hold.id, "approve")}>
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
    <Collapsible open={open} onOpenChange={setOpen} className="mt-2.5">
      <CollapsibleTrigger className="flex items-center gap-1 text-[11.5px] font-medium text-slate-500 transition hover:text-slate-800">
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
        {result.ok ? "Result" : "Tool error"}
        {result.label === "untrusted" && <Badge variant="untrusted" className="ml-1">untrusted content</Badge>}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-2.5 font-mono text-[11.5px] leading-relaxed text-slate-600">{result.text}</pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function StepCard({ item, onDecide, busy }) {
  const Icon = TOOL_ICON[item.tool] || FileText;
  const action = item.decision?.action || "allow";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border px-4 py-3 shadow-sm", FRAME[action])}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-100 text-sky-700"><Icon className="h-3.5 w-3.5" /></span>
        <span className="font-mono text-[13px] font-semibold text-slate-900">{item.tool}</span>
        <span className="text-[11px] text-slate-400">step {item.step}</span>
        <span className="ml-auto"><DecisionBadge item={item} /></span>
      </div>
      {item.thought && <p className="mt-2 text-[12.5px] italic leading-relaxed text-slate-500">{item.thought}</p>}
      <Args item={item} />
      <Verdict item={item} onDecide={onDecide} busy={busy} />
      <Result item={item} />
    </motion.div>
  );
}
