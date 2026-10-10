import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const PATHS = Array.from({ length: 26 }).map((_, i) => {
  const x1 = -189 + i * 12;
  const y1 = 229 - i * 10;
  const x2 = -1 + i * 18;
  const y2 = 751 - i * 10;
  return `M${x1} ${y1}C${x1} ${y1} ${-100 + i * 14} ${300 + i * 6} ${x2} ${y2}C${x2 + 60} ${y2 + 120} ${300 + i * 16} ${900} ${300 + i * 16} ${900}`;
});

export default function BackgroundBeams({ className }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden", className)}>
      <svg className="pointer-events-none absolute z-0 h-full w-full" width="100%" height="100%" viewBox="0 0 696 316" fill="none">
        {PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke={`url(#beam-${i})`}
            strokeOpacity="0.4"
            strokeWidth="0.5"
          />
        ))}
        <defs>
          {PATHS.map((_, i) => (
            <motion.linearGradient
              key={i}
              id={`beam-${i}`}
              gradientUnits="userSpaceOnUse"
              initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
              animate={{ x1: ["0%", "100%"], x2: ["0%", "95%"], y1: ["0%", "100%"], y2: ["0%", `${93 + Math.random() * 8}%`] }}
              transition={{ duration: Math.random() * 10 + 10, ease: "easeInOut", repeat: Infinity, delay: Math.random() * 10 }}
            >
              <stop stopColor="#fc2947" stopOpacity="0" />
              <stop stopColor="#fc2947" />
              <stop offset="32.5%" stopColor="#3da5ff" />
              <stop offset="100%" stopColor="#3da5ff" stopOpacity="0" />
            </motion.linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
}
