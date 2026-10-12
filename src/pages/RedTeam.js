import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Swords, Play, Loader2, ShieldCheck, ShieldX, Bug, Cpu } from "lucide-react";
import { api } from "../api";
import { Panel, Empty, Chip, FROSTED_GLASS } from "../components/Sky";
import { NumberTicker } from "../ui/aceternity";
import { cn } from "../lib/utils";

function RateTile({ label, rate, caught, total, accent }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl p-5 text-white shadow-lg bg-gradient-to-br", accent)}>
      <div className="text-xs font-semibold uppercase tracking-wide text-white/80">{label}</div>
      <div className="mt-1 flex items-end gap-1">
        <NumberTicker value={Math.round((rate || 0) * 100)} className="text-5xl font-bold tabular-nums" />
        <span className="pb-1.5 text-2xl font-bold">%</span>
      </div>
      <div className="mt-1 text-sm text-white/85">caught {caught}/{total} attacks</div>
    </div>
  );
}

export default function RedTeam() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState([]);
  const [source, setSource] = useState("payload-bank");
  const [report, setReport] = useState(null);
  const esRef = useRef(null);

  useEffect(() => () => esRef.current?.close(), []);

  const finish = (rep) => { setReport(rep); setRunning(false); };

  const launch = async () => {
    esRef.current?.close();
    setRunning(true);
    setReport(null);
    setProgress([]);
    try {
      const c = await api.createRedteam(0);
      const es = api.redteamStream(c.id);
      esRef.current = es;
      es.addEventListener("start", (e) => setSource(JSON.parse(e.data).source));
      es.addEventListener("progress", (e) => setProgress((prev) => [...prev, JSON.parse(e.data)]));
      es.addEventListener("report", (e) => { finish(JSON.parse(e.data)); es.close(); toast.success("Campaign complete"); });
      es.onerror = () => { es.close(); api.startRedteam(c.id).then(finish).catch(() => setRunning(false)); };
    } catch (err) {
      toast.error(err.message);
      setRunning(false);
    }
  };

  const total = report?.total || (progress[0] ? progress[0].total : 0);
  const chartData = report
    ? [
        { name: "Riposte", rate: Math.round(report.riposte_rate * 100), fill: "#059669" },
        { name: "Naive guard", rate: Math.round(report.baseline_rate * 100), fill: "#94a3b8" },
      ]
    : [];

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-4 overflow-y-auto px-4 pb-6 pt-3 md:px-6">
      <header className={cn(FROSTED_GLASS, "flex flex-wrap items-center gap-4 px-5 py-4")}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-600/10 text-rose-700">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Red Team at Scale</h1>
            <p className="text-xs text-slate-500">Fire a campaign of injection attacks at Nova and score Riposte against a naive guardrail.</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Chip className="bg-slate-900/5 text-slate-600"><Cpu className="h-3 w-3" /> {source === "local-a100" ? "local A100" : "payload bank"}</Chip>
          <button
            onClick={launch}
            disabled={running}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Launch red team
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <RateTile label="Riposte" rate={report?.riposte_rate} caught={report?.riposte_caught || 0} total={total} accent="from-emerald-600 via-emerald-500 to-teal-500" />
        <RateTile label="Naive guardrail" rate={report?.baseline_rate} caught={report?.baseline_caught || 0} total={total} accent="from-slate-600 via-slate-500 to-slate-600" />
        <Panel icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} title="Catch rate" className="min-h-[9rem]">
          {report ? (
            <div className="h-40 w-full px-3 pb-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 28, top: 6, bottom: 6 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" width={82} tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Bar dataKey="rate" radius={[6, 6, 6, 6]} barSize={26}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    <LabelList dataKey="rate" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 12, fontWeight: 700, fill: "#0f172a" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty icon={ShieldCheck}>Launch a campaign to compare Riposte against the guardrail everyone else ships.</Empty>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel icon={<Swords className="h-4 w-4 text-sky-600" />} title="Attack feed" right={<span>{progress.length}{total ? `/${total}` : ""}</span>} className="h-[26rem]">
          {progress.length === 0 && !running ? (
            <Empty icon={Swords}>Each attack the uncensored red model throws shows up here, scored live.</Empty>
          ) : (
            <ul className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5">
              <AnimatePresence initial={false}>
                {progress.map((p) => (
                  <motion.li key={p.index} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 border-t border-slate-900/5 py-2.5 first:border-t-0">
                    <span className="w-8 shrink-0 font-mono text-[11px] text-slate-400">#{p.index}</span>
                    <span className="truncate text-[13px] font-medium text-slate-800">{p.technique}</span>
                    <span className="ml-auto flex shrink-0 items-center gap-1.5">
                      {p.riposte === "blocked"
                        ? <Chip className="bg-emerald-500/15 text-emerald-700"><ShieldCheck className="h-3 w-3" /> Riposte</Chip>
                        : <Chip className="bg-rose-500/15 text-rose-700"><ShieldX className="h-3 w-3" /> Riposte</Chip>}
                      {p.baseline === "blocked"
                        ? <Chip className="bg-emerald-500/10 text-emerald-600">naive</Chip>
                        : <Chip className="bg-rose-500/10 text-rose-600">naive</Chip>}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </Panel>

        <Panel icon={<Bug className="h-4 w-4 text-rose-600" />} title="Bypasses found" right={<span>{report?.bypasses?.length || 0}</span>} className="h-[26rem]">
          {!report ? (
            <Empty icon={Bug}>Attacks that slipped past Riposte land here — the product's own backlog.</Empty>
          ) : report.bypasses.length === 0 ? (
            <Empty icon={ShieldCheck}>No bypasses this run — Riposte held the line.</Empty>
          ) : (
            <ul className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 pb-3">
              {report.bypasses.map((b, i) => (
                <li key={i} className="border-t border-slate-900/5 py-3 first:border-t-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-900">{b.technique}</span>
                    <Chip className="ml-auto bg-rose-500/15 text-rose-700">{b.attack_id}</Chip>
                  </div>
                  <p className="mt-1 break-words font-mono text-[11px] leading-relaxed text-slate-500">{b.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {report && (
        <Panel icon={<ShieldCheck className="h-4 w-4 text-sky-600" />} title="By tactic (MITRE ATT&CK)">
          <div className="px-5 pb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="py-2">Tactic</th>
                  <th className="py-2">ID</th>
                  <th className="py-2 text-right">Attacks</th>
                  <th className="py-2 text-right">Riposte</th>
                  <th className="py-2 text-right">Naive</th>
                </tr>
              </thead>
              <tbody>
                {report.by_tactic.map((t) => (
                  <tr key={t.attack_id} className="border-t border-slate-900/5">
                    <td className="py-2 font-medium text-slate-800">{t.name}</td>
                    <td className="py-2 font-mono text-[12px] text-slate-500">{t.attack_id}</td>
                    <td className="py-2 text-right tabular-nums text-slate-600">{t.total}</td>
                    <td className="py-2 text-right font-semibold tabular-nums text-emerald-700">{t.riposte}/{t.total}</td>
                    <td className="py-2 text-right tabular-nums text-slate-500">{t.baseline}/{t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
