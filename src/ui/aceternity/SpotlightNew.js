import React from "react";
import { motion } from "framer-motion";

export default function SpotlightNew({
  gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(349, 97%, 62%, 0.10) 0, hsla(349, 90%, 50%, 0.04) 50%, transparent 80%)",
  gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 62%, 0.08) 0, hsla(210, 90%, 50%, 0.03) 80%, transparent 100%)",
  gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(349, 100%, 62%, 0.06) 0, hsla(349, 90%, 50%, 0.03) 80%, transparent 100%)",
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
    >
      <motion.div
        animate={{ x: [0, xOffset, 0] }}
        transition={{ duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute left-0 top-0 z-0 h-full w-1/2 pointer-events-none"
      >
        <div style={{ transform: `translateY(${translateY}px) rotate(-45deg)`, background: gradientFirst, width: `${width}px`, height: `${height}px` }} className="absolute left-0 top-0" />
        <div style={{ transform: "rotate(-45deg) translate(5%, -50%)", background: gradientSecond, width: `${smallWidth}px`, height: `${height}px` }} className="absolute left-0 top-0 origin-top-left" />
        <div style={{ transform: "rotate(-45deg) translate(-180%, -70%)", background: gradientThird, width: `${smallWidth}px`, height: `${height}px` }} className="absolute left-0 top-0 origin-top-left" />
      </motion.div>

      <motion.div
        animate={{ x: [0, -xOffset, 0] }}
        transition={{ duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute right-0 top-0 z-0 h-full w-1/2 pointer-events-none"
      >
        <div style={{ transform: `translateY(${translateY}px) rotate(45deg)`, background: gradientFirst, width: `${width}px`, height: `${height}px` }} className="absolute right-0 top-0" />
        <div style={{ transform: "rotate(45deg) translate(-5%, -50%)", background: gradientSecond, width: `${smallWidth}px`, height: `${height}px` }} className="absolute right-0 top-0 origin-top-right" />
        <div style={{ transform: "rotate(45deg) translate(180%, -70%)", background: gradientThird, width: `${smallWidth}px`, height: `${height}px` }} className="absolute right-0 top-0 origin-top-right" />
      </motion.div>
    </motion.div>
  );
}
