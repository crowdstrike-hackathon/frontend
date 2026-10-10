import React, { useId } from "react";
import { cn } from "../lib/utils";

export function LogoMark({ size = 28, className }) {
  const id = useId();
  const bg = `${id}-bg`;
  const body = `${id}-body`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Riposte"
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dbeefe" />
        </linearGradient>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${bg})`} stroke="#bae6fd" />

      <g transform="translate(0,0.8)" fill="#38bdf8" opacity="0.35">
        <rect x="6.5" y="17.6" width="18.5" height="6.8" rx="3.4" />
        <circle cx="12" cy="17.8" r="4.5" />
        <circle cx="17.6" cy="14.8" r="5.8" />
        <circle cx="21.6" cy="17.9" r="4.3" />
      </g>

      <g fill={`url(#${body})`}>
        <rect x="6.5" y="17.6" width="18.5" height="6.8" rx="3.4" />
        <circle cx="12" cy="17.8" r="4.5" />
        <circle cx="17.6" cy="14.8" r="5.8" />
        <circle cx="21.6" cy="17.9" r="4.3" />
      </g>

      <ellipse cx="16" cy="13.4" rx="6.2" ry="2.1" fill="#ffffff" opacity="0.65" />

      <path d="M24 6.6 L25.1 9.1 L27.6 10.2 L25.1 11.3 L24 13.8 L22.9 11.3 L20.4 10.2 L22.9 9.1 Z" fill="#fb7185" />
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
