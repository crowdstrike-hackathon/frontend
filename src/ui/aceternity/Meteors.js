import React from "react";
import { cn } from "../../lib/utils";

export default function Meteors({ number = 18, className }) {
  const meteors = new Array(number).fill(true);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {meteors.map((_, i) => (
        <span
          key={i}
          className={cn(
            "absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-slate-300 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-slate-400 before:to-transparent before:content-['']",
            className
          )}
          style={{
            top: `${Math.floor(Math.random() * 100)}%`,
            left: `${Math.floor(Math.random() * 100)}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 5 + 4}s`,
          }}
        />
      ))}
    </div>
  );
}
