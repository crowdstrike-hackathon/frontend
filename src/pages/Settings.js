import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api";
import AppShell from "../components/AppShell";
import Recents from "../components/chat/Recents";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Spinner } from "../components/ui/spinner";
import useChatHistory from "../lib/useChatHistory";
import { cn } from "../lib/utils";

const PRESETS = [
  { label: "OpenAI", base_url: "https://api.openai.com/v1" },
  { label: "Ollama on this machine", base_url: "http://localhost:11434/v1" },
];

const FIELD =
  "h-9 w-full rounded-md border border-line-strong bg-white/80 px-3 font-mono text-[13px] text-ink transition-colors placeholder:font-sans placeholder:text-ink-4 focus:border-ink-3 focus:bg-white focus:outline-none";

function Field({ id, label, hint, children }) {
  return (
    <div className="grid gap-1.5 py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
      <div>
        <label htmlFor={id} className="text-[13px] font-medium text-ink">{label}</label>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-3">{hint}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function describe(status) {
  if (!status) return null;
  if (status.reachable && status.available) return { ok: true, text: `Connected. ${status.model} is available at ${status.base_url}.` };
  if (status.reachable) return { ok: false, text: `The endpoint answers, but it has no model named ${status.model}.` };
  return { ok: false, text: `Nothing usable is answering at ${status.base_url}. Check the URL and the key.` };
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const history = useChatHistory();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState({ base_url: "", model: "", api_key: "" });
  const [status, setStatus] = useState(null);
  const [working, setWorking] = useState("");

  useEffect(() => {
    api
      .agentSettings()
      .then((data) => {
        setSaved(data);
        setStatus(data.status);
        setForm({ base_url: data.base_url, model: data.model, api_key: "" });
      })
      .catch((e) => toast.error(e.message));
  }, []);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setStatus(null);
  };

  const dirty = !!saved && (form.base_url.trim() !== saved.base_url || form.model.trim() !== saved.model || form.api_key.trim() !== "");
  const complete = form.base_url.trim() && form.model.trim();
  const result = describe(status);

  const test = async () => {
    setWorking("test");
    try {
      setStatus(await api.testAgentSettings(form));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setWorking("");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setWorking("save");
    try {
      const data = await api.saveAgentSettings(form);
      setSaved(data);
      setStatus(data.status);
      setForm({ base_url: data.base_url, model: data.model, api_key: "" });
      toast.success("Agent model saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWorking("");
    }
  };

  return (
    <AppShell
      onNew={() => navigate("/console")}
      sidebar={<Recents rows={history.rows} onOpen={(id) => navigate(`/console?chat=${id}`)} onRename={history.rename} onArchive={history.archive} onDelete={history.remove} />}
      header={<h1 className="text-[13.5px] font-medium text-ink">Settings</h1>}>
      <ScrollArea className="min-h-0 flex-1">
        <form onSubmit={save} className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8">
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">Account</h2>
          <div className="mb-10 mt-4 flex items-center gap-3 border-y border-line py-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold uppercase text-white">{(user?.name || user?.email || "").slice(0, 1)}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-medium text-ink">{user?.name || user?.email}</div>
              <div className="truncate text-[12.5px] text-ink-3">{[user?.email, user?.org].filter(Boolean).join(" · ")}</div>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">Agent model</h2>
          <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-ink-3">
            The model Nova runs on. Any endpoint that speaks the OpenAI chat completions API works. Riposte sits between the model and its tools whichever one you use.
          </p>
          <div className="mt-5 divide-y divide-line border-y border-line">
            <Field id="base_url" label="Base URL" hint="Where chat completion requests are sent.">
              <input id="base_url" value={form.base_url} onChange={set("base_url")} placeholder="https://api.openai.com/v1" spellCheck={false} autoComplete="off" className={FIELD} />
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, base_url: p.base_url }));
                      setStatus(null);
                    }}
                    className="underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink hover:decoration-ink"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field id="model" label="Model" hint="The model name the endpoint expects.">
              <input id="model" value={form.model} onChange={set("model")} placeholder="gpt-4.1-mini" spellCheck={false} autoComplete="off" className={FIELD} />
            </Field>
            <Field id="api_key" label="API key" hint="Stored on the Riposte server. It is never sent back to the browser.">
              <input
                id="api_key"
                type="password"
                value={form.api_key}
                onChange={set("api_key")}
                placeholder={saved?.has_key ? `Saved${saved.key_hint ? `, ends in ${saved.key_hint}` : ""}. Leave blank to keep it.` : "sk-..."}
                spellCheck={false}
                autoComplete="new-password"
                className={FIELD}
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" variant="dark" disabled={!dirty || !complete || !!working}>
              {working === "save" && <Spinner />} Save
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={!complete || !!working} onClick={test}>
              {working === "test" && <Spinner />} Test connection
            </Button>
            {result && <p className={cn("min-w-0 flex-1 basis-60 text-[12.5px] leading-snug", result.ok ? "text-emerald-700" : "text-red-700")}>{result.text}</p>}
          </div>
          <p className="mt-6 text-[12px] leading-relaxed text-ink-4">Changes apply to new messages in every conversation in this workspace.</p>
        </form>
      </ScrollArea>
    </AppShell>
  );
}
