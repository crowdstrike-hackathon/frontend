import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Settings as SettingsIcon, ShieldCheck, Swords, Save, Plug, CheckCircle2, XCircle, Loader2, Lock } from "lucide-react";
import { api } from "../api";
import { Panel, FROSTED_GLASS, Chip } from "../components/Sky";
import { cn } from "../lib/utils";

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500"
      />
    </label>
  );
}

function ConnectionCard({ icon, title, blurb, side, onChange, hasKey, result }) {
  return (
    <Panel icon={icon} title={title} right={result ? (result.ok ? <Chip className="bg-emerald-500/15 text-emerald-700"><CheckCircle2 className="h-3 w-3" /> {result.latency_ms}ms</Chip> : <Chip className="bg-rose-500/15 text-rose-700"><XCircle className="h-3 w-3" /> failed</Chip>) : null}>
      <div className="flex flex-col gap-3 px-5 pb-5">
        <p className="text-[12.5px] leading-relaxed text-slate-500">{blurb}</p>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Provider</span>
          <select
            value={side.kind}
            onChange={(e) => onChange("kind", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500"
          >
            <option value="openai">Local / OpenAI-compatible (vLLM, A100)</option>
            <option value="anthropic">Anthropic (Claude)</option>
          </select>
        </label>
        {side.kind !== "anthropic" && (
          <Field label="Base URL" value={side.base_url} onChange={(v) => onChange("base_url", v)} placeholder="http://10.0.0.5:8001/v1" />
        )}
        <Field label="Model" value={side.model} onChange={(v) => onChange("model", v)} placeholder={side.kind === "anthropic" ? "claude-opus-4-8" : "red-team-local"} />
        <Field
          label={hasKey ? "API key (stored — leave blank to keep)" : "API key"}
          type="password"
          value={side.api_key}
          onChange={(v) => onChange("api_key", v)}
          placeholder={hasKey ? "••••••••" : "sk-… (optional for local)"}
        />
        {result && !result.ok && <p className="break-words text-[11px] text-rose-600">{result.error}</p>}
      </div>
    </Panel>
  );
}

const empty = { kind: "openai", base_url: "", api_key: "", model: "" };

export default function Settings() {
  const [form, setForm] = useState({ sim_mode: "mock", blue: { ...empty, kind: "anthropic" }, red: { ...empty } });
  const [hasKey, setHasKey] = useState({ blue: false, red: false });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = useCallback((c) => {
    setForm({
      sim_mode: c.sim_mode,
      blue: { kind: c.blue.kind, base_url: c.blue.base_url || "", api_key: "", model: c.blue.model || "" },
      red: { kind: c.red.kind, base_url: c.red.base_url || "", api_key: "", model: c.red.model || "" },
    });
    setHasKey({ blue: c.blue.has_key, red: c.red.has_key });
  }, []);

  useEffect(() => { api.getConnection().then(load).catch(() => toast.error("Backend unreachable")); }, [load]);

  const setSide = (side) => (key, value) => setForm((f) => ({ ...f, [side]: { ...f[side], [key]: value } }));

  const bodyFor = () => {
    const side = (s) => {
      const o = { kind: s.kind, base_url: s.base_url, model: s.model };
      if (s.api_key) o.api_key = s.api_key;
      return o;
    };
    return { sim_mode: form.sim_mode, blue: side(form.blue), red: side(form.red) };
  };

  const save = async () => {
    setBusy(true);
    try {
      const c = await api.putConnection(bodyFor());
      load(c);
      toast.success("Connection saved");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setResult(null);
    try {
      setResult(await api.testConnection(bodyFor()));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setTesting(false);
    }
  };

  const base = "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-4 overflow-y-auto px-4 pb-6 pt-3 md:px-6">
      <header className={cn(FROSTED_GLASS, "flex flex-wrap items-center gap-4 px-5 py-4")}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900/5 text-slate-700">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Connections</h1>
            <p className="text-xs text-slate-500">Point Riposte at your own models. Red and blue can both run on-prem — nothing leaves your VPC.</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-slate-300 bg-white/70 p-1">
            <button onClick={() => setForm((f) => ({ ...f, sim_mode: "mock" }))} className={cn(base, form.sim_mode === "mock" ? "bg-slate-900 text-white shadow" : "text-slate-500")}>Mock</button>
            <button onClick={() => setForm((f) => ({ ...f, sim_mode: "live" }))} className={cn(base, form.sim_mode === "live" ? "bg-sky-600 text-white shadow" : "text-slate-500")}>Live</button>
          </div>
          <button onClick={test} disabled={testing} className="flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-60">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />} Test
          </button>
          <button onClick={save} disabled={busy} className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </header>

      {form.sim_mode === "mock" && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-300/60 bg-amber-50/80 px-4 py-3 text-[13px] text-amber-900">
          <Lock className="h-4 w-4 shrink-0" /> Mock mode is on — Nova and the red team run on deterministic local logic, no credentials needed. Switch to Live once your A100 endpoints are set.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ConnectionCard
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
          title="Blue — Nova & guard"
          blurb="The defended agent and Riposte's LLM judge. Use Claude, or your own local model to keep everything in-house."
          side={form.blue}
          onChange={setSide("blue")}
          hasKey={hasKey.blue}
          result={result?.blue}
        />
        <ConnectionCard
          icon={<Swords className="h-4 w-4 text-rose-600" />}
          title="Red — uncensored adversary"
          blurb="The local uncensored model that generates real attacks. This is the moat an aligned API can't provide."
          side={form.red}
          onChange={setSide("red")}
          hasKey={hasKey.red}
          result={result?.red}
        />
      </div>
    </div>
  );
}
