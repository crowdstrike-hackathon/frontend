import React, { useCallback, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export default function GlowingEffect({ className, spread = 40, proximity = 64, borderWidth = 1.5 }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    const active = dist < r.width / 2 + proximity;
    el.style.setProperty("--glow-active", active ? "1" : "0");
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    el.style.setProperty("--glow-angle", `${angle}deg`);
  }, [proximity]);

  useEffect(() => {
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [onMove]);

  return (
    <div
      ref={ref}
      style={{ "--glow-active": 0, "--glow-angle": "0deg", padding: borderWidth }}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--glow-active)] transition-opacity duration-300",
        className
      )}
    >
      <div
        className="h-full w-full rounded-[inherit]"
        style={{
          background: `conic-gradient(from var(--glow-angle), transparent 0deg, #fc2947 ${spread}deg, #3da5ff ${spread * 2}deg, transparent ${spread * 3}deg)`,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: borderWidth,
        }}
      />
    </div>
  );
}
