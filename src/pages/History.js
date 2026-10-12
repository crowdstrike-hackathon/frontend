import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { api } from "../api";
import AppShell from "../components/AppShell";
import { ScrollArea } from "../components/ui/scroll-area";
import { MODE_LABEL, OUTCOME, TONE } from "../lib/run";
import { cn } from "../lib/utils";

function when(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function History() {
  const nav = useNavigate();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api.history().then(setRows).catch((e) => {
      toast.error(e.message);
      setRows([]);
    });
  }, []);

  return (
    <AppShell header={<h1 className="text-[13.5px] font-medium text-ink">History</h1>}>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-8">
          <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">Run history</h2>
          <p className="mt-1 text-[14px] text-ink-3">Every ticket Nova has handled, the defense that was on, and what happened.</p>
          {rows === null && (
            <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-brand" /></div>
          )}
          {rows?.length === 0 && <p className="py-16 text-[14px] text-ink-3">No runs yet. Send Nova a ticket from the console.</p>}
          {rows?.length > 0 && (
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {rows.map((r) => {
                const meta = OUTCOME[r.outcome] || OUTCOME.error;
                const tone = TONE[meta.tone];
                return (
                  <li key={r.id}>
                    <button onClick={() => nav(`/console?run=${r.id}`)} className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-paper-3">
                      <span className="hidden w-16 shrink-0 font-mono text-[11.5px] text-ink-4 sm:block">{r.ticket_id}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] text-ink">{r.subject}</div>
                        <div className="truncate text-[12.5px] text-ink-3">{r.summary}</div>
                      </div>
                      <span className="hidden w-28 shrink-0 text-[12.5px] text-ink-3 sm:block">{MODE_LABEL[r.mode] || r.mode}</span>
                      <span className={cn("flex w-36 shrink-0 items-center gap-1.5 text-[12.5px] font-medium", tone.text)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} /> {meta.label}
                      </span>
                      <span className="hidden w-28 shrink-0 text-right text-[12px] text-ink-4 md:block">{when(r.created_at)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </ScrollArea>
    </AppShell>
  );
}
