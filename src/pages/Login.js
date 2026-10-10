import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Swords, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import AuroraBackground from "../ui/AuroraBackground";
import Spotlight from "../ui/Spotlight";
import GlassCard from "../ui/GlassCard";
import { GlowButton } from "../ui/GlowButton";
import DuelBeam from "../ui/DuelBeam";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  "Adversary AI emits live attack telemetry laced with deception",
  "Defender AI reasons through planted logs to a verdict",
  "Governed response actions, gated behind human approval",
];

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", org: "" });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form);
      toast.success("Welcome to Sentinel");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuroraBackground className="flex items-center justify-center p-6">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#fc2947" />
      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden flex-col justify-center lg:flex"
        >
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red/15 ring-1 ring-red/40">
              <Shield className="h-5 w-5 text-red" />
            </div>
            <span className="text-xl font-black tracking-tight">SENTINEL</span>
            <span className="rounded-full border-hair px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-400">
              Agentic SOC
            </span>
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            <span className="text-gradient">Red vs Blue,</span>
            <br />
            <span className="text-gradient-red">at machine speed.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            A living SOC where an adversary AI attacks and a defender AI investigates — every run
            scored, persisted, and replayable. Train your blue team against a real opponent, not a script.
          </p>
          <div className="mt-8 w-full max-w-md rounded-2xl border-hair glass p-4">
            <DuelBeam />
          </div>
          <ul className="mt-6 space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                <Swords className="mt-0.5 h-4 w-4 shrink-0 text-red/70" />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center"
        >
          <GlassCard className="w-full p-8">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <Shield className="h-6 w-6 text-red" />
              <span className="text-lg font-black">SENTINEL</span>
            </div>
            <h2 className="text-2xl font-bold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {mode === "login" ? "Sign in to run simulations" : "Start defending in seconds"}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3 overflow-hidden"
                  >
                    <Field label="Name" value={form.name} onChange={set("name")} placeholder="Ada" />
                    <Field label="Organization" value={form.org} onChange={set("org")} placeholder="Acme SOC" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Field label="Email" type="email" required value={form.email} onChange={set("email")} placeholder="you@company.com" />
              <Field label="Password" type="password" required value={form.password} onChange={set("password")} placeholder="••••••••" />

              <GlowButton type="submit" disabled={busy} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
              </GlowButton>
            </form>

            <div className="mt-5 text-center text-sm text-slate-400">
              {mode === "login" ? "New here?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="font-semibold text-red hover:underline"
              >
                {mode === "login" ? "Create one" : "Sign in"}
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      <input
        className="w-full rounded-xl border-hair bg-ink-900/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-red/50 focus:ring-2 focus:ring-red/20"
        {...props}
      />
    </label>
  );
}
