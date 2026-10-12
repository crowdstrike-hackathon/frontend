import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Crosshair, Swords, Radar, Clock, Settings as SettingsIcon, LogOut } from "lucide-react";
import { LogoMark } from "../ui/Logo";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const GROUPS = [
  {
    label: "Defend",
    items: [
      { name: "Console", to: "/console", icon: MessageSquare },
      { name: "Live Fire", to: "/live-fire", icon: Crosshair },
    ],
  },
  {
    label: "Attack",
    items: [
      { name: "Red Team", to: "/red-team", icon: Swords },
      { name: "Simulation", to: "/dashboard", icon: Radar },
    ],
  },
  {
    label: "Workspace",
    items: [
      { name: "History", to: "/history", icon: Clock },
      { name: "Settings", to: "/settings", icon: SettingsIcon },
    ],
  },
];

export default function Rail() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.07] bg-[#0b0f16] md:flex">
      <Link to="/console" className="flex items-center gap-2.5 px-6 pb-6 pt-5">
        <LogoMark size={26} />
        <span className="text-[15px] font-semibold tracking-tight text-white">Riposte</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3">
        {GROUPS.map((g) => (
          <div key={g.label} className="mb-5">
            <div className="mb-1 px-3 text-[11px] font-medium text-slate-600">{g.label}</div>
            {g.items.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                    active ? "bg-white/[0.08] font-medium text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  )}
                >
                  <Icon className="h-4 w-4" /> {n.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-600 text-sm font-semibold text-white">{initial}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-slate-200">{user?.name || user?.email}</div>
            <div className="truncate text-[11px] text-slate-500">{user?.org || "Operator"}</div>
          </div>
          <button onClick={() => { logout(); nav("/login"); }} className="shrink-0 text-slate-500 transition hover:text-slate-300" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
