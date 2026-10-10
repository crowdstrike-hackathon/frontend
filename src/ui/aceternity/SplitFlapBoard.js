import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .-/#";

function layout(text, cols) {
  const lines = [];
  text.split("\n").forEach((raw) => {
    const words = raw.trim().split(/\s+/);
    let line = "";
    words.forEach((w) => {
      if ((line + " " + w).trim().length > cols) {
        lines.push(line.trim());
        line = w;
      } else {
        line = (line + " " + w).trim();
      }
    });
    lines.push(line);
  });
  return lines.map((l) => l.toUpperCase().slice(0, cols).padEnd(cols, " ").split(""));
}

function Tile({ target, delay, tone }) {
  const [ch, setCh] = useState(" ");
  const raf = useRef();
  useEffect(() => {
    let settled = false;
    const start = performance.now();
    const spins = 6 + Math.floor(Math.random() * 8);
    let i = 0;
    const tick = (now) => {
      if (now - start < delay) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      if (i < spins) {
        setCh(CHARSET[Math.floor(Math.random() * CHARSET.length)]);
        i += 1;
        raf.current = requestAnimationFrame(() => setTimeout(() => (raf.current = requestAnimationFrame(tick)), 34));
      } else if (!settled) {
        settled = true;
        setCh(target);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, delay]);

  return (
    <div className="relative flex h-9 w-7 items-center justify-center overflow-hidden rounded-[3px] bg-ink-950 text-[15px] font-bold shadow-inner ring-1 ring-white/5 sm:h-11 sm:w-8 sm:text-lg">
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 h-px bg-black/60" />
      <motion.span
        key={ch}
        initial={{ rotateX: -80, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.16 }}
        className={cn("font-mono", tone)}
        style={{ transformOrigin: "center" }}
      >
        {ch === " " ? " " : ch}
      </motion.span>
    </div>
  );
}

export default function SplitFlapBoard({ text, cols = 14, className, tone = "text-slate-100" }) {
  const grid = layout(text, cols);
  return (
    <div className={cn("inline-flex flex-col gap-1 rounded-xl border-hair bg-black/40 p-2", className)}>
      {grid.map((row, r) => (
        <div key={r} className="flex gap-1">
          {row.map((c, ci) => (
            <Tile key={`${r}-${ci}-${c}`} target={c} delay={(r * cols + ci) * 22} tone={tone} />
          ))}
        </div>
      ))}
    </div>
  );
}
