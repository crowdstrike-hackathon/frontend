import React, { useRef, useState } from "react";
import { cn } from "../../lib/utils";

export default function CardSpotlight({ className, children, color = "rgba(252,41,71,0.14)", dots = true }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const mask = `radial-gradient(260px circle at ${pos.x}px ${pos.y}px, white, transparent 70%)`;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn("group/spot relative overflow-hidden rounded-2xl border-hair bg-ink-900/70", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
        style={{ opacity: hover ? 1 : 0, background: color, WebkitMaskImage: mask, maskImage: mask }}
      />
      {dots && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
          style={{
            opacity: hover ? 1 : 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
