import React from "react";
import { ScrollArea } from "../ui/scroll-area";
import { MODE_LABEL, OUTCOME, TONE } from "../../lib/chat";
import { cn } from "../../lib/utils";

const MODES = ["off", "keyword", "riposte"];
const EMPTY = "text-[13px] text-ink-3";

function Section({ title, children }) {
  return (
    <section className="border-b border-line px-4 py-4 last:border-b-0">
      <h3 className="mb-2.5 text-[11.5px] font-medium text-ink-3">{title}</h3>
      {children}
    </section>
  );
}

function Scoreboard({ result }) {
  return (
    <dl className="divide-y divide-line rounded-md border border-line bg-white/50">
      {MODES.map((mode) => {
        const meta = result[mode] ? OUTCOME[result[mode]] || OUTCOME.error : null;
        const tone = meta ? TONE[meta.tone] : null;
        return (
          <div key={mode} className="flex items-center gap-2 px-3 py-2 text-[13px]">
            <dt className="text-ink-2">{MODE_LABEL[mode]}</dt>
            <dd className={cn("ml-auto flex items-center gap-1.5", tone ? cn("font-medium", tone.text) : "text-ink-4")}>
              {tone && <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />}
              {meta ? meta.label : "not tried"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function Effects({ chat }) {
  const effects = chat?.effects;
  if (!effects) return <p className={EMPTY}>Nothing has left the sandbox yet.</p>;
  const incidents = chat.turns.flatMap((t) => t.incidents || []);
  const leaked = (channel, to) => incidents.some((i) => i.kind === "leak" && i.channel === channel && i.to === to);
  const rows = [
    ...effects.outbox.map((m, i) => ({ key: `m${i}`, verb: "email", title: m.to, detail: m.subject, bad: leaked("send_email", m.to) })),
    ...effects.refunds.map((r, i) => ({
      key: `r${i}`,
      verb: "refund",
      title: `$${Number(r.amount).toLocaleString()} to ${r.customer}`,
      detail: r.approved ? "Approved by a person" : r.reason,
      bad: incidents.some((x) => x.kind === "refund" && x.customer === r.customer),
    })),
    ...effects.replies.map((r, i) => ({ key: `p${i}`, verb: "reply", title: r.to || "the sender", detail: r.message, bad: leaked("reply", r.to) })),
  ];
  if (!rows.length) return <p className={EMPTY}>Nothing has left the sandbox in this chat.</p>;
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-white/50">
      {rows.map(({ key, verb, title, detail, bad }) => (
        <li key={key} className={cn("border-l-2 px-3 py-2 first:rounded-t-md last:rounded-b-md", bad ? "border-l-red-700 bg-red-50/60" : "border-l-transparent")}>
          <div className="flex items-baseline gap-2 text-[13px]">
            <span className={cn("w-11 shrink-0 font-mono text-[11px]", bad ? "text-red-700" : "text-ink-4")}>{verb}</span>
            <span className="min-w-0 flex-1 break-words text-ink">{title}</span>
            {bad && <span className="shrink-0 text-[11px] font-semibold text-red-700">violation</span>}
          </div>
          {detail && <div className="mt-0.5 line-clamp-2 break-words pl-[52px] text-[12px] text-ink-3">{detail}</div>}
        </li>
      ))}
    </ul>
  );
}

export default function SidePanel({ chat, compare, world }) {
  const policy = world?.policy;
  return (
    <ScrollArea className="h-full">
      <Section title="What you are looking at">
        <p className="text-[12.5px] leading-relaxed text-ink-3">
          Nova is the agent. Riposte checks each tool call Nova makes and marks it allowed, held or blocked. The company, its customers and their keys are a sandbox, so nothing here is real data. The attacks and decisions are live.
        </p>
      </Section>
      <Section title="Same message, each mode">
        {compare ? (
          <>
            <p className="mb-2 truncate text-[12.5px] text-ink-3">{compare.message}</p>
            <Scoreboard result={compare.result} />
          </>
        ) : (
          <p className={EMPTY}>Hand Nova a ticket to compare the defenses.</p>
        )}
      </Section>
      <Section title="What left the sandbox">
        <Effects chat={chat} />
      </Section>
      <Section title="Northwind's customers">
        <ul className="divide-y divide-line rounded-md border border-line bg-white/50">
          {(world?.customers || []).map((c) => (
            <li key={c.id} className="px-3 py-2">
              <div className="flex items-baseline gap-2 text-[13px] text-ink">
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className="font-mono text-[11px] text-ink-4">{c.id}</span>
              </div>
              <div className="mt-px truncate font-mono text-[11.5px] text-ink-3">{c.email}</div>
            </li>
          ))}
        </ul>
        {policy && (
          <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
            A key may only go to its owner's address on file. Refunds above ${policy.refund_limit} need a person. Internal mail: {policy.internal_domains.join(", ")}.
          </p>
        )}
      </Section>
    </ScrollArea>
  );
}
