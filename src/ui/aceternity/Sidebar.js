import React, { createContext, useContext, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const SidebarCtx = createContext(null);
export const useSidebar = () => useContext(SidebarCtx);

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false);
  return <SidebarCtx.Provider value={{ open, setOpen }}>{children}</SidebarCtx.Provider>;
}

export function SidebarBody({ children }) {
  const { open, setOpen } = useSidebar();
  return (
    <motion.div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      animate={{ width: open ? 248 : 76 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="relative hidden h-full shrink-0 flex-col border-r border-white/5 bg-ink-900/70 px-3 py-5 backdrop-blur-xl md:flex"
    >
      {children}
    </motion.div>
  );
}

export function SidebarLink({ icon, label, active, onClick }) {
  const { open } = useSidebar();
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/sb flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active ? "bg-red/10 text-white ring-1 ring-red/30" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <motion.span
        animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
        className="overflow-hidden whitespace-nowrap"
      >
        {label}
      </motion.span>
    </button>
  );
}
