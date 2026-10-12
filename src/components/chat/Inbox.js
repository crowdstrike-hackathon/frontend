import React from "react";
import { Inbox as InboxIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";

const KIND = {
  attack: { variant: "untrusted", label: "attack" },
  benign: { variant: "trusted", label: "benign" },
};

export default function Inbox({ tickets, file, activeId, disabled, onPick }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 px-4 pb-2 pt-4">
        <InboxIcon className="h-4 w-4 text-sky-700" />
        <h2 className="text-sm font-semibold text-slate-900">Ticket inbox</h2>
        <span className="ml-auto font-mono text-[11px] text-slate-400">{file?.path}</span>
      </div>
      {file?.errors?.length > 0 && (
        <p className="mx-4 mb-2 rounded-xl bg-amber-50 px-3 py-2 text-[11.5px] leading-relaxed text-amber-700">{file.errors[0]}</p>
      )}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-1.5 px-3 pb-3">
          {tickets.length === 0 && (
            <p className="px-2 py-8 text-center text-[12.5px] leading-relaxed text-slate-500">
              No tickets found. Add a tickets.json file next to the backend and reload.
            </p>
          )}
          {tickets.map((t) => {
            const kind = KIND[t.kind];
            return (
              <button
                key={t.id}
                disabled={disabled}
                onClick={() => onPick(t)}
                className={cn(
                  "rounded-2xl border px-3 py-2.5 text-left transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60",
                  activeId === t.id ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400">{t.id}</span>
                  {kind && <Badge variant={kind.variant} className="ml-auto">{kind.label}</Badge>}
                </div>
                <div className="mt-1 text-[13px] font-semibold leading-snug text-slate-900">{t.title || t.subject}</div>
                <div className="mt-0.5 truncate text-[11.5px] text-slate-500">{t.from}</div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
