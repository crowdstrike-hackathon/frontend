import React from "react";
import { CircleDollarSign, KeyRound, Mail, MessageSquareReply, ScrollText } from "lucide-react";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { MODE_LABEL, OUTCOME, TONE, isLive } from "../../lib/run";
import { cn } from "../../lib/utils";

const MODES = ["off", "keyword", "riposte"];

function Section({ icon: Icon, title, children }) {
  return (
    <section className="px-4 py-3.5">
      <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5 text-sky-700" /> {title}
      </h3>
      {children}
    </section>
  );
}

function Scoreboard({ runs, run }) {
  const ticketId = run?.ticket?.id;
  const latest = {};
  runs.forEach((r) => {
    if (r.ticket.id === ticketId && !isLive(r)) latest[r.mode] = r;
  });
  return (
    <div className="space-y-1.5">
      {MODES.map((mode) => {
        const result = latest[mode];
        const meta = result ? OUTCOME[result.outcome] || OUTCOME.error : null;
        const tone = meta ? TONE[meta.tone] : null;
        return (
          <div key={mode} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px]", tone ? tone.panel : "border-dashed border-slate-200 bg-white")}>
            <span className={cn("h-2 w-2 rounded-full", tone ? tone.dot : "bg-slate-200")} />
            <span className="font-medium text-slate-700">{MODE_LABEL[mode]}</span>
            <span className={cn("ml-auto font-semibold", tone ? tone.text : "text-slate-400")}>{meta ? meta.label : "not run yet"}</span>
          </div>
        );
      })}
    </div>
  );
}

function Effects({ run }) {
  const effects = run?.effects;
  if (!effects) return <p className="text-[12.5px] text-slate-500">Nothing has left the sandbox yet.</p>;
  const leaks = (run.incidents || []).filter((i) => i.kind === "leak");
  const leaked = (channel, to) => leaks.some((i) => i.channel === channel && i.to === to);
  const rows = [
    ...effects.outbox.map((m, i) => ({ key: `m${i}`, Icon: Mail, title: `Email to ${m.to}`, detail: m.subject, bad: leaked("send_email", m.to) })),
    ...effects.refunds.map((r, i) => ({
      key: `r${i}`,
      Icon: CircleDollarSign,
      title: `Refund of $${Number(r.amount).toLocaleString()} to ${r.customer}`,
      detail: r.approved ? "Approved by a person" : r.reason,
      bad: (run.incidents || []).some((x) => x.kind === "refund" && x.customer === r.customer),
    })),
    ...effects.replies.map((r, i) => ({ key: `p${i}`, Icon: MessageSquareReply, title: `Reply to ${r.to || "the sender"}`, detail: r.message, bad: leaked("reply", r.to) })),
  ];
  if (!rows.length) return <p className="text-[12.5px] text-slate-500">Nothing left the sandbox in this run.</p>;
  return (
    <ul className="space-y-1.5">
      {rows.map(({ key, Icon, title, detail, bad }) => (
        <li key={key} className={cn("flex gap-2.5 rounded-xl border px-3 py-2", bad ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white")}>
          <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", bad ? "text-rose-600" : "text-slate-400")} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <span className="min-w-0 flex-1 break-words text-[12.5px] font-medium text-slate-800">{title}</span>
              {bad && <Badge variant="block">violation</Badge>}
            </div>
            {detail && <div className="mt-0.5 line-clamp-2 break-words text-[11.5px] text-slate-500">{detail}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function SidePanel({ runs, run, world }) {
  const policy = world?.policy;
  return (
    <ScrollArea className="h-full">
      <Section icon={ScrollText} title="Same ticket, each mode">
        {run ? <Scoreboard runs={runs} run={run} /> : <p className="text-[12.5px] text-slate-500">Pick a ticket to start.</p>}
      </Section>
      <Separator />
      <Section icon={Mail} title="What left the sandbox">
        <Effects run={run} />
      </Section>
      <Separator />
      <Section icon={KeyRound} title="Addresses on file">
        <ul className="space-y-1.5">
          {(world?.customers || []).map((c) => (
            <li key={c.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center gap-2 text-[12.5px] font-medium text-slate-800">
                {c.name} <span className="ml-auto font-mono text-[11px] text-slate-400">{c.id}</span>
              </div>
              <div className="mt-0.5 font-mono text-[11.5px] text-slate-500">{c.email}</div>
            </li>
          ))}
        </ul>
        {policy && (
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-slate-500">
            A key may only go to its owner's address on file. Refunds above ${policy.refund_limit} need a person. Internal mail: {policy.internal_domains.join(", ")}.
          </p>
        )}
      </Section>
    </ScrollArea>
  );
}
