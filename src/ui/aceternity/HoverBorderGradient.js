import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const DIR = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
const MAP = {
  TOP: "radial-gradient(20.7% 50% at 50% 0%, #fc2947 0%, rgba(255,255,255,0) 100%)",
  LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, #3da5ff 0%, rgba(255,255,255,0) 100%)",
  BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, #fc2947 0%, rgba(255,255,255,0) 100%)",
  RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, #3da5ff 0%, rgba(255,255,255,0) 100%)",
};
const HIGHLIGHT = "radial-gradient(75% 181% at 50% 50%, #fc2947 0%, rgba(255,255,255,0) 100%)";

export default function HoverBorderGradient({ children, className, containerClassName, as: Tag = "button", duration = 1, ...props }) {
  const [hovered, setHovered] = useState(false);
  const [dir, setDir] = useState("TOP");

  useEffect(() => {
    if (hovered) return;
    const id = setInterval(() => setDir((d) => DIR[(DIR.indexOf(d) + 1) % DIR.length]), duration * 1000);
    return () => clearInterval(id);
  }, [hovered, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("relative flex w-fit items-center justify-center overflow-visible rounded-full border-hair bg-ink-900/40 p-px transition duration-500", containerClassName)}
      {...props}
    >
      <div className={cn("z-10 rounded-[inherit] bg-ink-900 px-5 py-2 text-sm font-semibold text-white", className)}>
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{ filter: "blur(2px)" }}
        initial={{ background: MAP[dir] }}
        animate={{ background: hovered ? [MAP[dir], HIGHLIGHT] : MAP[dir] }}
        transition={{ ease: "linear", duration }}
      />
      <div className="absolute inset-[2px] z-[1] rounded-[inherit] bg-ink-900" />
    </Tag>
  );
}
