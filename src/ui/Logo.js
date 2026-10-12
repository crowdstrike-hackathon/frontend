import React from "react";
import cloud from "../assets/cloud.png";
import { cn } from "../lib/utils";

export function LogoMark({ size = 28, className }) {
  return <img src={cloud} alt="Riposte" width={size} height={size} draggable={false} className={cn("shrink-0 select-none object-contain", className)} />;
}

// Nova, Northwind's support agent: a compass needle pointing north, a nod to Northwind.
// Kept distinct from the Riposte cloud so the agent and the firewall guarding it never look alike.
export function NovaMark({ size = 28, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Nova" className={cn("shrink-0 select-none", className)}>
      <circle cx="16" cy="16" r="16" fill="#0B2A55" />
      <path d="M16 5.5L19.2 16H12.8Z" fill="#FFFFFF" />
      <path d="M16 26.5L19.2 16H12.8Z" fill="#7DD3FC" />
      <circle cx="16" cy="16" r="1.6" fill="#0B2A55" stroke="#FFFFFF" strokeWidth="0.8" />
    </svg>
  );
}

export default function Logo({ size = 28, showText = true, textClassName, className }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {showText && (
        <span className={cn("text-base font-semibold tracking-tight", textClassName)}>Riposte</span>
      )}
    </span>
  );
}
