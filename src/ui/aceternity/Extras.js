import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../../lib/utils";

export function NumberTicker({ value, className, decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 30, stiffness: 120 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(value || 0);
  }, [inView, value, motionVal]);

  useEffect(() => spring.on("change", (v) => setDisplay(v.toFixed(decimals))), [spring, decimals]);

  return <span ref={ref} className={className}>{display}</span>;
}

export function WobbleCard({ children, className, containerClassName }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: (e.clientX - (r.left + r.width / 2)) / 18, y: (e.clientY - (r.top + r.height / 2)) / 18 });
  };
  return (
    <div
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPos({ x: 0, y: 0 }); }}
      className={cn("relative overflow-hidden rounded-2xl", containerClassName)}
    >
      <motion.div
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${hover ? 1.012 : 1})` }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="h-full w-full"
      >
        <motion.div
          style={{ transform: `translate3d(${-pos.x}px, ${-pos.y}px, 0)` }}
          className={cn("h-full w-full", className)}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function BackgroundGradient({ children, className, containerClassName }) {
  return (
    <div className={cn("group relative rounded-2xl p-[1.5px]", containerClassName)}>
      <div className="absolute inset-0 z-[1] rounded-2xl bg-[radial-gradient(circle_farthest-side_at_0_100%,#fc2947,transparent),radial-gradient(circle_farthest-side_at_100%_0,#3da5ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#2ee6a0,transparent),radial-gradient(circle_farthest-side_at_0_0,#ff8a5b,#141826)] bg-[length:300%_300%] opacity-50 blur-xl transition duration-500 animate-move-bg group-hover:opacity-80" />
      <div className="absolute inset-0 z-[1] rounded-2xl bg-[radial-gradient(circle_farthest-side_at_0_100%,#fc2947,transparent),radial-gradient(circle_farthest-side_at_100%_0,#3da5ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#2ee6a0,transparent),radial-gradient(circle_farthest-side_at_0_0,#ff8a5b,#141826)] bg-[length:300%_300%] animate-move-bg" />
      <div className={cn("relative z-10 rounded-2xl bg-ink-900", className)}>{children}</div>
    </div>
  );
}

export function GridBackground({ className, children }) {
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}
