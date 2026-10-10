import React, { useId } from "react";
import { cn } from "../lib/utils";

export function LogoMark({ size = 28, className }) {
  const id = useId();
  const bg = `${id}-bg`;
  const cloud = `${id}-cloud`;
  const rose = `${id}-rose`;
  const sky = `${id}-sky`;
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
        <linearGradient id={cloud} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e9f5ff" />
        </linearGradient>
        <linearGradient id={rose} x1="8" y1="24" x2="24" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id={sky} x1="24" y1="24" x2="8" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${bg})`} stroke="#bae6fd" />

      <g fill={`url(#${cloud})`}>
        <circle cx="12.5" cy="19.5" r="4.2" />
        <circle cx="17.5" cy="17" r="5.4" />
        <circle cx="21.5" cy="20" r="4" />
        <rect x="8.3" y="20" width="15" height="5" rx="2.5" />
      </g>

      <g strokeLinecap="round" strokeLinejoin="round">
        <line x1="8.5" y1="23.5" x2="23.5" y2="8.5" stroke={`url(#${rose})`} strokeWidth="2.6" />
        <line x1="9.2" y1="20.4" x2="11.7" y2="22.9" stroke={`url(#${rose})`} strokeWidth="2.2" />
        <circle cx="8.5" cy="23.5" r="1.7" fill="#fb7185" />

        <line x1="23.5" y1="23.5" x2="8.5" y2="8.5" stroke={`url(#${sky})`} strokeWidth="2.6" />
        <line x1="20.3" y1="22.9" x2="22.8" y2="20.4" stroke={`url(#${sky})`} strokeWidth="2.2" />
        <circle cx="23.5" cy="23.5" r="1.7" fill="#38bdf8" />
      </g>

      <path d="M16 11.4 L19.6 16 L16 20.6 L12.4 16 Z" fill="#ffffff" stroke="#7dd3fc" strokeWidth="0.8" />
      <path d="M16 13.4 L18 16 L16 18.6 L14 16 Z" fill="#0ea5e9" />
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
