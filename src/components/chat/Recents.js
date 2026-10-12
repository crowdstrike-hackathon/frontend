import React from "react";
import { ScrollArea } from "../ui/scroll-area";
import { MODE_LABEL, OUTCOME, TONE } from "../../lib/run";
import { cn } from "../../lib/utils";

export default function Recents({ rows, activeId, disabled, onOpen }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="px-4 pb-1 pt-3 text-[11.5px] font-medium text-ink-3">History</h2>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-px px-2 pb-2">
          {rows.length === 0 && <p className="px-2 py-2 text-[12.5px] leading-relaxed text-ink-3">Runs you start will show up here.</p>}
          {rows.map((r) => {
            const meta = OUTCOME[r.outcome];
            return (
              <button
                key={r.id}
                disabled={disabled}
                onClick={() => onOpen(r.id)}
                className={cn(
                  "rounded-md px-2 py-1.5 text-left transition-colors hover:bg-paper-3 disabled:cursor-not-allowed disabled:opacity-50",
                  activeId === r.id && "bg-paper-3"
                )}
              >
                <div className="truncate text-[13.5px] text-ink">{r.subject}</div>
                <div className="mt-px truncate text-[11.5px] text-ink-3">
                  {MODE_LABEL[r.mode] || r.mode}
                  {meta && <span className={cn("font-medium", TONE[meta.tone].text)}> · {meta.label}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
