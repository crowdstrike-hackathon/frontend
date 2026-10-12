import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Loader2 } from "lucide-react";
import { api } from "../api";
import { CloudShader } from "../ui/aceternity";
import AppBar from "../components/AppBar";
import { Badge } from "../components/ui/badge";
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
    <div className="relative flex h-screen flex-col overflow-hidden">
      <CloudShader className="absolute inset-0" skyTopColor="#245a9c" skyBottomColor="#7fb2de" count={4} speed={0.6} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0b2a55]/55 to-transparent" />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-3 md:p-4">
        <AppBar />
        <main className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-xl backdrop-blur-xl">
          <div className="border-b border-slate-200/80 px-5 py-4">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Run history</h1>
            <p className="mt-0.5 text-[13px] text-slate-500">Every ticket Nova has handled, with the defense that was on and what happened.</p>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            {rows === null && (
              <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-sky-700" /></div>
            )}
            {rows?.length === 0 && <p className="py-16 text-center text-sm text-slate-500">No runs yet. Send Nova a ticket from the console.</p>}
            <ul className="divide-y divide-slate-100">
              {(rows || []).map((r) => {
                const meta = OUTCOME[r.outcome] || OUTCOME.error;
                const tone = TONE[meta.tone];
                return (
                  <li key={r.id}>
                    <button onClick={() => nav(`/console?run=${r.id}`)} className="group flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-sky-50">
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", tone.dot)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-400">{r.ticket_id}</span>
                          <span className="truncate text-[13.5px] font-semibold text-slate-900">{r.subject}</span>
                        </div>
                        <div className="mt-0.5 truncate text-[12px] text-slate-500">{r.summary}</div>
                      </div>
                      <Badge variant="outline" className="hidden sm:inline-flex">{MODE_LABEL[r.mode] || r.mode}</Badge>
                      <span className={cn("hidden w-32 text-right text-[12.5px] font-semibold md:block", tone.text)}>{meta.label}</span>
                      <span className="hidden w-28 text-right text-[11.5px] text-slate-400 md:block">{when(r.created_at)}</span>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-sky-700" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
