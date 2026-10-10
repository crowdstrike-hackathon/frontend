import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export function TextGenerateEffect({ words, className, delay = 0 }) {
  const arr = words.split(" ");
  return (
    <span className={className}>
      {arr.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: delay + i * 0.06 }}
          className="inline-block"
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </span>
  );
}

export function TypewriterEffect({ words, className, cursorClassName }) {
  return (
    <div className={cn("flex flex-wrap items-center", className)}>
      {words.map((word, wi) => (
        <div key={wi} className="inline-block">
          {word.text.split("").map((ch, ci) => (
            <motion.span
              key={ci}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (wi * 6 + ci) * 0.045, duration: 0.1 }}
              className={cn("inline-block", word.className)}
            >
              {ch}
            </motion.span>
          ))}
          &nbsp;
        </div>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
        className={cn("inline-block h-6 w-[3px] rounded-full bg-red md:h-9", cursorClassName)}
      />
    </div>
  );
}

export function FlipWords({ words, duration = 2600, className }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), duration);
    return () => clearInterval(id);
  }, [words.length, duration]);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -14, filter: "blur(8px)", position: "absolute" }}
        transition={{ duration: 0.4 }}
        className={cn("inline-block", className)}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
}

export function ColourfulText({ text, className }) {
  return (
    <span
      className={cn(
        "animate-text-gradient bg-[linear-gradient(90deg,#fc2947,#ff8a5b,#3da5ff,#2ee6a0,#fc2947)] bg-[length:200%_auto] bg-clip-text text-transparent",
        className
      )}
    >
      {text}
    </span>
  );
}
