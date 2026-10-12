import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Play, Loader2, ShieldCheck, ShieldX, Bug, FileSearch, AlertTriangle } from "lucide-react";
import { api } from "../api";
import { Panel, Empty, Chip, Page, PageHeader, Segmented, BTN_PRIMARY, SURFACE } from "../components/Sky";
import { NumberTicker } from "../ui/aceternity";
import { cn } from "../lib/utils";

const SEV = {
  critical: "bg-rose-500/15 text-rose-300",
  high: "bg-orange-500/15 text-orange-300",
  medium: "bg-amber-500/15 text-amber-300",
  low: "bg-white/[0.06] text-slate-400",
};

function ScanView({ scan, running }) {
  if (!scan) {
    return (
      <Panel icon={<FileSearch className="h-4 w-4 text-slate-500" />} title="Codebase findings" className="min-h-[24rem] flex-1">
        <Empty icon={running ? Loader2 : FileSearch}>{running ? "Scanning…" : "Scan the agent's code for prompt-injection paths, unsafe tool use, unguarded egress, and hardcoded secrets."}</Empty>
      </Panel>
    );
  }
  return (
    <Panel
      icon={<FileSearch className="h-4 w-4 text-slate-500" />}
      title="Codebase findings"
      right={<span>{scan.findings.length} issues · {scan.files_scanned} files</span>}
      className="min-h-[24rem] flex-1"
    >
      <ul className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        {scan.findings.map((f) => (
          <li key={f.id} className="border-t border-white/[0.06] py-3 first:border-t-0">
            <div className="flex items-center gap-2">
              <Chip className={cn("py-0.5", SEV[f.severity] || SEV.low)}><AlertTriangle className="h-3 w-3" /> {f.severity}</Chip>
              <span className="text-[13px] font-semibold text-slate-100">{f.title}</span>
              {f.attack_id && <span className="ml-auto shrink-0 font-mono text-[11px] text-slate-500">{f.attack_id}</span>}
            </div>
            <p className="mt-1 break-all font-mono text-[11px] text-slate-400">{f.file}:{f.line} — {f.snippet}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-emerald-300">→ {f.recommendation}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Stat({ label, value, suffix, note, bar, barClass }) {
  return (
    <div className={cn(SURFACE, "p-5")}>
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className="mt-2 flex items-baseline gap-0.5 text-white">
        <NumberTicker value={value} className="text-4xl font-semibold tabular-nums tracking-tight" />
        {suffix && <span className="text-xl font-semibold text-slate-400">{suffix}</span>}
      </div>
      {bar !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div className={cn("h-full rounded-full transition-all duration-700", barClass)} style={{ width: `${bar}%` }} />
        </div>
      )}
      <div className="mt-2 text-xs text-slate-500">{note}</div>
    </div>
  );
}

export default function RedTeam() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState([]);
  const [source, setSource] = useState("payload-bank");
  const [report, setReport] = useState(null);
  const [target, setTarget] = useState("nova");
  const [scan, setScan] = useState(null);
  const esRef = useRef(null);

  useEffect(() => () => esRef.current?.close(), []);

  const finish = (rep) => { setReport(rep); setRunning(false); };

  const scanCode = async () => {
    setRunning(true);
    setScan(null);
    try {
      setScan(await api.scanCode({ use_sample: true }));
      toast.success("Scan complete");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  };

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
  const rip = Math.round((report?.riposte_rate || 0) * 100);
  const base = Math.round((report?.baseline_rate || 0) * 100);

  return (
    <Page>
      <PageHeader title="Red Team" subtitle="Attack your own agent before someone else does.">
        <Segmented
          value={target}
          onChange={setTarget}
          disabled={running}
          options={[
            { value: "nova", label: "Live agent", icon: Swords },
            { value: "code", label: "Codebase", icon: FileSearch },
          ]}
        />
        <button onClick={target === "code" ? scanCode : launch} disabled={running} className={BTN_PRIMARY}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : target === "code" ? <FileSearch className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {target === "code" ? "Scan codebase" : "Launch campaign"}
        </button>
      </PageHeader>

      {target === "code" && <ScanView scan={scan} running={running} />}

      {target === "nova" && <>
      <div className="grid gap-5 md:grid-cols-3">
        <Stat label="Caught by Riposte" value={rip} suffix="%" bar={rip} barClass="bg-emerald-400" note={report ? `${report.riposte_caught} of ${total} attacks blocked` : "Run a campaign to measure"} />
        <Stat label="Caught by a keyword guardrail" value={base} suffix="%" bar={base} barClass="bg-slate-500" note={report ? `${report.baseline_caught} of ${total} attacks blocked` : "The baseline most teams ship"} />
        <Stat label="Attacks fired" value={progress.length} note={source === "local-a100" ? "Written by your local red model" : "From the built-in payload bank"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel icon={<Swords className="h-4 w-4 text-slate-500" />} title="Attack feed" right={<span>{progress.length}{total ? `/${total}` : ""}</span>} className="h-[26rem]">
          {progress.length === 0 && !running ? (
            <Empty icon={Swords}>Each attack shows up here as it is fired, with who caught it.</Empty>
          ) : (
            <ul className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4">
              <AnimatePresence initial={false}>
                {progress.map((p) => (
                  <motion.li key={p.index} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 border-t border-white/[0.06] py-2.5 first:border-t-0">
                    <span className="w-8 shrink-0 font-mono text-[11px] text-slate-500">#{p.index}</span>
                    <span className="truncate text-[13px] font-medium text-slate-200">{p.technique}</span>
                    <span className="ml-auto flex shrink-0 items-center gap-1.5">
                      {p.riposte === "blocked"
                        ? <Chip className="bg-emerald-500/15 text-emerald-300"><ShieldCheck className="h-3 w-3" /> Riposte caught</Chip>
                        : <Chip className="bg-rose-500/15 text-rose-300"><ShieldX className="h-3 w-3" /> Riposte missed</Chip>}
                      {p.baseline === "blocked"
                        ? <Chip className="bg-white/[0.06] text-slate-300">keyword caught</Chip>
                        : <Chip className="bg-white/[0.03] text-slate-500">keyword missed</Chip>}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </Panel>

        <Panel icon={<Bug className="h-4 w-4 text-slate-500" />} title="Bypasses found" right={<span>{report?.bypasses?.length || 0}</span>} className="h-[26rem]">
          {!report ? (
            <Empty icon={Bug}>Attacks that got past Riposte are listed here so you know what to fix next.</Empty>
          ) : report.bypasses.length === 0 ? (
            <Empty icon={ShieldCheck}>No bypasses this run.</Empty>
          ) : (
            <ul className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 pb-3">
              {report.bypasses.map((b, i) => (
                <li key={i} className="border-t border-white/[0.06] py-3 first:border-t-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-100">{b.technique}</span>
                    <Chip className="ml-auto bg-rose-500/15 text-rose-300">{b.attack_id}</Chip>
                  </div>
                  <p className="mt-1 break-words font-mono text-[11px] leading-relaxed text-slate-400">{b.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {report && (
        <Panel icon={<ShieldCheck className="h-4 w-4 text-slate-500" />} title="By MITRE ATT&CK technique">
          <div className="px-4 pb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2">Tactic</th>
                  <th className="py-2">ID</th>
                  <th className="py-2 text-right">Attacks</th>
                  <th className="py-2 text-right">Riposte</th>
                  <th className="py-2 text-right">Keyword</th>
                </tr>
              </thead>
              <tbody>
                {report.by_tactic.map((t) => (
                  <tr key={t.attack_id} className="border-t border-white/[0.06]">
                    <td className="py-2 font-medium text-slate-200">{t.name}</td>
                    <td className="py-2 font-mono text-[12px] text-slate-400">{t.attack_id}</td>
                    <td className="py-2 text-right tabular-nums text-slate-400">{t.total}</td>
                    <td className="py-2 text-right font-semibold tabular-nums text-emerald-300">{t.riposte}/{t.total}</td>
                    <td className="py-2 text-right tabular-nums text-slate-400">{t.baseline}/{t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      </>}
    </Page>
  );
}
