import React, { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function AnimatedTooltip({ items }) {
  const [hovered, setHovered] = useState(null);
  const x = useMotionValue(0);
  const rotate = useSpring(useTransform(x, [-60, 60], [-18, 18]), { stiffness: 100, damping: 8 });
  const translateX = useSpring(useTransform(x, [-60, 60], [-30, 30]), { stiffness: 100, damping: 8 });

  const onMove = (e) => {
    const half = e.currentTarget.offsetWidth / 2;
    x.set(e.nativeEvent.offsetX - half);
  };

  return (
    <div className="flex items-center">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative -mr-2"
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
        >
          <AnimatePresence>
            {hovered === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.6 }}
                style={{ translateX, rotate, whiteSpace: "nowrap" }}
                className="absolute -top-14 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center rounded-xl border-hair bg-ink-850 px-3 py-1.5 text-xs shadow-glow"
              >
                <div className="font-semibold text-slate-100">{item.name}</div>
                <div className="text-[11px] text-slate-400">{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div
            onMouseMove={onMove}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink-700 bg-gradient-to-br from-red to-azure text-xs font-bold text-white transition duration-300 group-hover:z-30 group-hover:scale-110"
          >
            {item.initials}
          </div>
        </div>
      ))}
    </div>
  );
}
