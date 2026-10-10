import React, { useRef } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";

export function MovingBorder({ children, duration = 3000, rx = "30%", ry = "30%" }) {
  const pathRef = useRef(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) progress.set(((time / duration) * length) % length);
  });

  const x = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).x || 0);
  const y = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).y || 0);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg className="absolute h-full w-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div style={{ position: "absolute", top: 0, left: 0, display: "inline-block", transform }}>
        {children}
      </motion.div>
    </>
  );
}

export function MovingBorderButton({ children, className, containerClassName, borderClassName, duration, ...props }) {
  return (
    <button
      className={cn("relative h-12 overflow-hidden rounded-xl bg-transparent p-[1.5px] text-sm", containerClassName)}
      {...props}
    >
      <div className="absolute inset-0 rounded-[11px]">
        <MovingBorder duration={duration} rx="11px" ry="11px">
          <div className={cn("h-24 w-24 bg-[radial-gradient(#fc2947_40%,transparent_60%)] opacity-90", borderClassName)} />
        </MovingBorder>
      </div>
      <div className={cn("relative flex h-full w-full items-center justify-center gap-2 rounded-[11px] border-hair bg-ink-900/90 px-5 font-semibold text-white backdrop-blur-xl", className)}>
        {children}
      </div>
    </button>
  );
}
