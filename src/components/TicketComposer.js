import React from "react";
import { Inbox, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Panel, Chip } from "./Sky";

export default function TicketComposer({ tickets, value, onPick, subject, body, onSubject, onBody, poisoned, technique, disabled, className }) {
  return (
    <Panel
      className={className}
      icon={<Inbox className="h-4 w-4 text-sky-600" />}
      title="Customer ticket"
      right={
        poisoned ? (
          <Chip className="bg-rose-500/15 text-rose-700"><AlertTriangle className="h-3 w-3" /> {technique || "poisoned"}</Chip>
        ) : (
          <Chip className="bg-emerald-500/15 text-emerald-700"><CheckCircle2 className="h-3 w-3" /> benign</Chip>
        )
      }
    >
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
        <select
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onPick(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 disabled:opacity-60"
        >
          {tickets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} · {t.subject}
            </option>
          ))}
        </select>
        <input
          value={subject}
          disabled={disabled}
          onChange={(e) => onSubject(e.target.value)}
          placeholder="Subject"
          className="w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 disabled:opacity-60"
        />
        <textarea
          value={body}
          disabled={disabled}
          onChange={(e) => onBody(e.target.value)}
          rows={12}
          placeholder="Paste a support ticket. Hide a prompt injection in it and watch what Nova does."
          className="scrollbar-thin min-h-[12rem] flex-1 resize-none rounded-xl border border-slate-300 bg-white/80 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-slate-800 outline-none focus:border-sky-500 disabled:opacity-60"
        />
        <p className="text-[11px] text-slate-500">Edit the body to craft your own attack — in mock mode Nova follows anything that reads like an injection.</p>
      </div>
    </Panel>
  );
}
