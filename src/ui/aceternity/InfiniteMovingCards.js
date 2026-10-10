import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export default function InfiniteMovingCards({ items, direction = "left", speed = "slow", className }) {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;
    const scroller = scrollerRef.current;
    Array.from(scroller.children).forEach((child) => {
      scroller.appendChild(child.cloneNode(true));
    });
    containerRef.current.style.setProperty("--animation-direction", direction === "left" ? "forwards" : "reverse");
    const dur = speed === "fast" ? "20s" : speed === "slow" ? "60s" : "40s";
    containerRef.current.style.setProperty("--animation-duration", dur);
    setStart(true);
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn("scroller relative z-20 max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]", className)}
    >
      <ul ref={scrollerRef} className={cn("flex w-max min-w-full shrink-0 flex-nowrap gap-3 py-1", start && "animate-scroll")}>
        {items.map((item, i) => (
          <li
            key={i}
            className="flex shrink-0 items-center gap-2 rounded-xl border-hair bg-ink-850/70 px-3.5 py-2"
          >
            {item.icon}
            <div>
              <div className="font-mono text-[11px] text-red/80">{item.id}</div>
              <div className="text-xs font-medium text-slate-200">{item.name}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
