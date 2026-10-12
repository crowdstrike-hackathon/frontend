import React from "react";
import cloud from "../assets/cloud.png";
import { cn } from "../lib/utils";

export function LogoMark({ size = 28, className }) {
  return <img src={cloud} alt="Riposte" width={size} height={size} draggable={false} className={cn("shrink-0 select-none object-contain", className)} />;
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
