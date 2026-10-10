import React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export function GlowButton({ children, className, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-red text-white shadow-glow hover:brightness-110",
    blue: "bg-azure text-ink-950 shadow-glow-blue hover:brightness-110",
    ghost: "bg-white/5 text-slate-200 border-hair hover:bg-white/10",
    danger: "bg-transparent text-red border border-red/40 hover:bg-red/10",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function MovingBorderButton({ children, className, ...props }) {
  return (
    <button
      className={cn("group relative overflow-hidden rounded-xl p-[1.5px]", className)}
      {...props}
    >
      <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#fc2947_0%,#3da5ff_50%,#fc2947_100%)]" />
      <span className="relative flex h-full w-full items-center justify-center gap-2 rounded-[11px] bg-ink-900 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition group-hover:bg-ink-850">
        {children}
      </span>
    </button>
  );
}
