import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, Swords, Save, Plug, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";
import { api } from "../api";
import { Panel, Chip, Page, PageHeader, Segmented, BTN_PRIMARY, BTN_SECONDARY, INPUT } from "../components/Sky";

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT}
      />
    </label>
  );
}

function ConnectionCard({ icon, title, blurb, side, onChange, hasKey, result }) {
  return (
    <Panel icon={icon} title={title} right={result ? (result.ok ? <Chip className="bg-emerald-500/15 text-emerald-300"><CheckCircle2 className="h-3 w-3" /> {result.latency_ms}ms</Chip> : <Chip className="bg-rose-500/15 text-rose-300"><XCircle className="h-3 w-3" /> failed</Chip>) : null}>
      <div className="flex flex-col gap-3.5 p-4">
        <p className="text-[12.5px] leading-relaxed text-slate-400">{blurb}</p>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-400">Provider</span>
          <select
            value={side.kind}
            onChange={(e) => onChange("kind", e.target.value)}
            className={INPUT}
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
        {result && !result.ok && <p className="break-words text-[11px] text-rose-400">{result.error}</p>}
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

  return (
    <Page className="max-w-5xl">
      <PageHeader title="Connections" subtitle="Point Riposte at your own models.">
        <Segmented
          value={form.sim_mode}
          onChange={(v) => setForm((f) => ({ ...f, sim_mode: v }))}
          options={[
            { value: "mock", label: "Mock" },
            { value: "live", label: "Live", activeClass: "bg-sky-500/25 text-sky-100" },
          ]}
        />
        <button onClick={test} disabled={testing} className={BTN_SECONDARY}>
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />} Test
        </button>
        <button onClick={save} disabled={busy} className={BTN_PRIMARY}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
      </PageHeader>

      {form.sim_mode === "mock" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[13px] text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <span><span className="font-medium text-slate-200">Mock mode.</span> Nova and the red team run on built-in deterministic logic, so no credentials are needed. Add your endpoints below and switch to Live to use real models.</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <ConnectionCard
          icon={<ShieldCheck className="h-4 w-4 text-slate-500" />}
          title="Blue model"
          blurb="Runs Nova (the agent being defended) and the copilot. Use Claude, or a local model to keep everything in-house."
          side={form.blue}
          onChange={setSide("blue")}
          hasKey={hasKey.blue}
          result={result?.blue}
        />
        <ConnectionCard
          icon={<Swords className="h-4 w-4 text-slate-500" />}
          title="Red model"
          blurb="The local uncensored model that writes the attacks. Any OpenAI-compatible endpoint works, such as vLLM on your A100."
          side={form.red}
          onChange={setSide("red")}
          hasKey={hasKey.red}
          result={result?.red}
        />
      </div>
    </Page>
  );
}
