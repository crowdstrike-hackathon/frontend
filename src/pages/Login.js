import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, ArrowRight, Swords, ShieldCheck, Activity } from "lucide-react";
import toast from "react-hot-toast";
import {
  SpotlightNew,
  BackgroundBeams,
  TypewriterEffect,
  FlipWords,
  HoverBorderGradient,
  BackgroundGradient,
  AnimatedTooltip,
  InfiniteMovingCards,
  SplitFlapBoard,
} from "../ui/aceternity";
import { useAuth } from "../context/AuthContext";

const BOARD_MESSAGES = [
  "RED TEAM ONLINE",
  "BLUE TEAM READY",
  "PROMPT INJECTION DETECTED",
  "DECEPTION FILTERED",
  "ATTACK CONTAINED",
];

const TITLE = [
  { text: "Red" },
  { text: "vs" },
  { text: "Blue,", className: "text-red" },
  { text: "at" },
  { text: "machine" },
  { text: "speed.", className: "text-azure" },
];

const TEAM = [
  { id: 1, name: "Red Agent", designation: "Local A100 adversary", initials: "R" },
  { id: 2, name: "Blue Agent", designation: "Claude defender", initials: "B" },
  { id: 3, name: "Analyst", designation: "You, in the loop", initials: "A" },
];

const TECHS = [
  { id: "T1566.002", name: "Prompt Injection", icon: <Swords className="h-3.5 w-3.5 text-red" /> },
  { id: "T1621", name: "MFA Fatigue", icon: <Shield className="h-3.5 w-3.5 text-amber" /> },
  { id: "T1552.005", name: "Cloud Creds", icon: <Activity className="h-3.5 w-3.5 text-azure" /> },
  { id: "T1078", name: "Valid Accounts", icon: <ShieldCheck className="h-3.5 w-3.5 text-lime" /> },
  { id: "T1530", name: "Cloud Exfil", icon: <Swords className="h-3.5 w-3.5 text-red" /> },
];

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", org: "" });
  const [busy, setBusy] = useState(false);
  const [board, setBoard] = useState(0);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    const id = setInterval(() => setBoard((b) => (b + 1) % BOARD_MESSAGES.length), 5200);
    return () => clearInterval(id);
  }, []);

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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ink-950 px-6 py-10">
      <SpotlightNew />
      <BackgroundBeams />
      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="hidden flex-col lg:flex">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red/15 ring-1 ring-red/40">
              <Shield className="h-5 w-5 text-red" />
            </div>
            <span className="text-xl font-black tracking-tight">SENTINEL</span>
            <span className="rounded-full border-hair px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-400">Agentic SOC</span>
          </div>

          <TypewriterEffect words={TITLE} className="text-4xl font-black tracking-tight md:text-5xl" />

          <div className="mt-5 max-w-md text-base text-slate-400">
            An autonomous{" "}
            <FlipWords words={["adversary", "red team", "attacker", "threat"]} className="font-semibold text-red" />
            meets an AI{" "}
            <FlipWords words={["defender", "analyst", "blue team", "SOC"]} className="font-semibold text-azure" />
            — every engagement scored, persisted, replayable.
          </div>

          <div className="mt-8">
            <SplitFlapBoard text={BOARD_MESSAGES[board]} cols={14} tone="text-red" />
          </div>

          <div className="mt-6 flex items-center gap-5">
            <AnimatedTooltip items={TEAM} />
            <span className="text-xs text-slate-500">3 agents, one shared memory of the fight</span>
          </div>

          <div className="mt-6 w-full max-w-md">
            <InfiniteMovingCards items={TECHS} speed="slow" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="mx-auto w-full max-w-md">
          <BackgroundGradient className="p-7">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <Shield className="h-6 w-6 text-red" />
              <span className="text-lg font-black">SENTINEL</span>
            </div>
            <h2 className="text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p className="mt-1 text-sm text-slate-400">{mode === "login" ? "Sign in to run simulations" : "Start defending in seconds"}</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {mode === "register" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 gap-3 overflow-hidden">
                    <Field label="Name" value={form.name} onChange={set("name")} placeholder="Ada" />
                    <Field label="Organization" value={form.org} onChange={set("org")} placeholder="Acme SOC" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Field label="Email" type="email" required value={form.email} onChange={set("email")} placeholder="you@company.com" />
              <Field label="Password" type="password" required value={form.password} onChange={set("password")} placeholder="••••••••" />

              <HoverBorderGradient type="submit" disabled={busy} containerClassName="w-full rounded-xl" className="w-full justify-center rounded-xl py-2.5">
                <span className="flex items-center justify-center gap-2">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
                </span>
              </HoverBorderGradient>
            </form>

            <div className="mt-5 text-center text-sm text-slate-400">
              {mode === "login" ? "New here?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-semibold text-red hover:underline">
                {mode === "login" ? "Create one" : "Sign in"}
              </button>
            </div>
          </BackgroundGradient>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      <input
        className="w-full rounded-xl border-hair bg-ink-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-red/50 focus:ring-2 focus:ring-red/20"
        {...props}
      />
    </label>
  );
}
