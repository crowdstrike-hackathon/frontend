import React, { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

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
