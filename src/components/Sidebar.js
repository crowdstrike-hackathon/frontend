import React from "react";
import { NavLink } from "react-router-dom";
import { Shield, Swords, History, LogOut, Radar } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/", label: "War Room", icon: Radar, end: true },
  { to: "/history", label: "History", icon: History },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="flex w-[232px] shrink-0 flex-col border-r border-white/5 bg-ink-900/60 p-4">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red/15 ring-1 ring-red/40">
          <Shield className="h-5 w-5 text-red" />
        </div>
        <div>
          <div className="text-sm font-black tracking-tight">SENTINEL</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Agentic SOC</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive ? "bg-red/10 text-white ring-1 ring-red/30" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="mb-3 flex items-center gap-3 rounded-xl border-hair bg-white/5 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red to-azure text-xs font-bold text-white">
            {(user?.name || user?.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-slate-200">{user?.name || "Analyst"}</div>
            <div className="truncate text-[11px] text-slate-500">{user?.org || user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-red"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-600">
          <Swords className="h-3 w-3" /> red vs blue · machine speed
        </div>
      </div>
    </aside>
  );
}
