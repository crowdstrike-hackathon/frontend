import React from "react";
import { Inbox, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Panel, Chip, INPUT } from "./Sky";
import { cn } from "../lib/utils";

export default function TicketComposer({ tickets, value, onPick, subject, body, onSubject, onBody, poisoned, technique, disabled, className }) {
  return (
    <Panel
      className={className}
      icon={<Inbox className="h-4 w-4 text-slate-500" />}
      title="Customer ticket"
      right={
        poisoned ? (
          <Chip className="bg-rose-500/15 text-rose-300"><AlertTriangle className="h-3 w-3" /> {technique || "poisoned"}</Chip>
        ) : (
          <Chip className="bg-emerald-500/15 text-emerald-300"><CheckCircle2 className="h-3 w-3" /> benign</Chip>
        )
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-4">
        <select value={value || ""} disabled={disabled} onChange={(e) => onPick(e.target.value)} className={INPUT}>
          {tickets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} · {t.subject}
            </option>
          ))}
        </select>
        <input value={subject} disabled={disabled} onChange={(e) => onSubject(e.target.value)} placeholder="Subject" className={INPUT} />
        <textarea
          value={body}
          disabled={disabled}
          onChange={(e) => onBody(e.target.value)}
          placeholder="Paste a support ticket. Hide a prompt injection in it and watch what Nova does."
          className={cn(INPUT, "scrollbar-thin min-h-[10rem] flex-1 resize-none font-mono text-[12.5px] leading-relaxed")}
        />
        <p className="text-[11px] text-slate-500">Edit the body to write your own attack.</p>
      </div>
    </Panel>
  );
}
