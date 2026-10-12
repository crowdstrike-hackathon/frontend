import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { CloudShader } from "../ui/aceternity";
import { LogoMark } from "../ui/Logo";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", org: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isLogin = mode === "login";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form);
      toast.success("Welcome to Riposte");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CloudShader className="absolute inset-0" speed={0.6} />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark size={36} />
          <span className="text-xl font-semibold tracking-tight text-white drop-shadow-sm">Riposte</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8 w-full max-w-md rounded-[2rem] border border-white/30 bg-white/20 p-2 shadow-2xl backdrop-blur-md"
        >
          <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-lg sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{isLogin ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-1 text-sm text-slate-500">{isLogin ? "Sign in to open the console." : "Set up a seat to test the agent firewall."}</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 gap-3 overflow-hidden">
                    <Field label="Name" value={form.name} onChange={set("name")} placeholder="Ada" autoComplete="name" />
                    <Field label="Organization" value={form.org} onChange={set("org")} placeholder="Acme SOC" autoComplete="organization" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Field label="Email" type="email" required value={form.email} onChange={set("email")} placeholder="you@company.com" autoComplete="email" />
              <Field label="Password" type="password" required value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete={isLogin ? "current-password" : "new-password"} />

              <button
                type="submit"
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-sky-700 text-sm font-semibold text-white shadow-lg shadow-sky-700/30 transition hover:-translate-y-0.5 hover:bg-sky-800 disabled:translate-y-0 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{isLogin ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-500">
              {isLogin ? "New here?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(isLogin ? "register" : "login")} className="font-semibold text-sky-700 hover:underline">
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      <input
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20"
        {...props}
      />
    </label>
  );
}
