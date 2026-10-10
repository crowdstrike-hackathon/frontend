import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, History, LogOut, Radar } from "lucide-react";
import { SidebarProvider, SidebarBody, SidebarLink, useSidebar } from "../ui/aceternity";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const LINKS = [
  { to: "/", label: "War Room", icon: Radar },
  { to: "/history", label: "History", icon: History },
];

function Brand() {
  const { open } = useSidebar();
  return (
    <div className="mb-8 flex items-center gap-2.5 px-1">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red/15 ring-1 ring-red/40">
        <Shield className="h-5 w-5 text-red" />
      </div>
      <motion.div animate={{ opacity: open ? 1 : 0 }} className="overflow-hidden whitespace-nowrap">
        <div className="text-sm font-black tracking-tight">SENTINEL</div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-500">Agentic SOC</div>
      </motion.div>
    </div>
  );
}

function UserCard() {
  const { open } = useSidebar();
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-2.5 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red to-azure text-xs font-bold text-white">
        {(user?.name || user?.email || "?").slice(0, 1).toUpperCase()}
      </div>
      <motion.div animate={{ opacity: open ? 1 : 0 }} className="min-w-0 overflow-hidden">
        <div className="truncate text-xs font-semibold text-neutral-200">{user?.name || "Analyst"}</div>
        <div className="truncate text-[11px] text-neutral-500">{user?.org || user?.email}</div>
      </motion.div>
    </div>
  );
}

function Nav() {
  const { logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const activeFor = (to) => (to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to));

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div>
        <Brand />
        <nav className="flex flex-col gap-1">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <SidebarLink
              key={to}
              link={{ label, href: "#", icon: <Icon className="h-[18px] w-[18px] shrink-0 text-neutral-300" /> }}
              onClick={(e) => { e.preventDefault(); nav(to); }}
              className={cn("rounded-xl px-2.5 transition", activeFor(to) ? "bg-red/10 ring-1 ring-red/30" : "hover:bg-white/5")}
            />
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-2">
        <UserCard />
        <SidebarLink
          link={{ label: "Sign out", href: "#", icon: <LogOut className="h-[18px] w-[18px] shrink-0 text-neutral-300" /> }}
          onClick={(e) => { e.preventDefault(); logout(); }}
          className="rounded-xl px-2.5 hover:bg-white/5"
        />
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <SidebarProvider>
      <SidebarBody className="justify-between border-r border-white/5 !bg-ink-900/70 backdrop-blur-xl">
        <Nav />
      </SidebarBody>
    </SidebarProvider>
  );
}
