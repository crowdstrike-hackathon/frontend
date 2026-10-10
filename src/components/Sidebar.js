import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, History, LogOut, Radar } from "lucide-react";
import { SidebarProvider, SidebarBody, SidebarLink, useSidebar } from "../ui/aceternity";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/", label: "War Room", icon: Radar },
  { to: "/history", label: "History", icon: History },
];

function Inner() {
  const { open } = useSidebar();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <SidebarBody>
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red/15 ring-1 ring-red/40">
          <Shield className="h-5 w-5 text-red" />
        </div>
        <motion.div animate={{ opacity: open ? 1 : 0 }} className="overflow-hidden whitespace-nowrap">
          <div className="text-sm font-black tracking-tight">SENTINEL</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Agentic SOC</div>
        </motion.div>
      </div>

      <nav className="flex flex-col gap-1">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <SidebarLink
            key={to}
            icon={<Icon className="h-[18px] w-[18px]" />}
            label={label}
            active={to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to)}
            onClick={() => nav(to)}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl border-hair bg-white/5 px-2.5 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red to-azure text-xs font-bold text-white">
            {(user?.name || user?.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <motion.div animate={{ opacity: open ? 1 : 0 }} className="min-w-0 overflow-hidden">
            <div className="truncate text-xs font-semibold text-slate-200">{user?.name || "Analyst"}</div>
            <div className="truncate text-[11px] text-slate-500">{user?.org || user?.email}</div>
          </motion.div>
        </div>
        <SidebarLink icon={<LogOut className="h-[18px] w-[18px]" />} label="Sign out" onClick={logout} />
      </div>
    </SidebarBody>
  );
}

export default function Sidebar() {
  return (
    <SidebarProvider>
      <Inner />
    </SidebarProvider>
  );
}
