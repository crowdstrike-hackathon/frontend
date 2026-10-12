import React from "react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";

const DOT = { attack: "bg-red-600", benign: "bg-emerald-600" };

export default function Inbox({ tickets, file, activeId, disabled, onPick }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-baseline gap-2 px-4 pb-1 pt-3">
        <h2 className="text-[11.5px] font-medium text-ink-3">Tickets</h2>
        <span className="ml-auto truncate font-mono text-[10.5px] text-ink-4">{file?.path}</span>
      </div>
      {file?.errors?.length > 0 && (
        <p className="mx-2 mb-1 rounded-md border border-amber-700/25 bg-amber-50 px-2 py-1.5 text-[11.5px] leading-snug text-amber-800">{file.errors[0]}</p>
      )}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-px px-2 pb-2">
          {tickets.length === 0 && (
            <p className="px-2 py-6 text-[12.5px] leading-relaxed text-ink-3">No tickets found. Add a tickets.json file next to the backend and reload.</p>
          )}
          {tickets.map((t) => (
            <button
              key={t.id}
              disabled={disabled}
              onClick={() => onPick(t)}
              title={t.kind || undefined}
              className={cn(
                "group rounded-md px-2 py-1.5 text-left transition-colors hover:bg-paper-3 disabled:cursor-not-allowed disabled:opacity-50",
                activeId === t.id && "bg-paper-3"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[t.kind] || "bg-ink-4")} />
                <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{t.title || t.subject}</span>
              </div>
              <div className="mt-px flex items-center gap-1.5 pl-3.5 text-[11.5px] text-ink-3">
                <span className="font-mono text-[10.5px]">{t.id}</span>
                <span className="truncate">{t.from}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
