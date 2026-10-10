import React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export default function TextGenerate({ text, className, delay = 0 }) {
  const words = text.split(" ");
  return (
    <span className={cn(className)}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.45, delay: delay + i * 0.05 }}
          className="inline-block"
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </span>
  );
}
