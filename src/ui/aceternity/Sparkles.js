import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export default function Sparkles({ className, density = 60, color = "#ffffff", maxSize = 1.4, minSize = 0.5 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const particles = Array.from({ length: density }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * (maxSize - minSize) + minSize,
      o: Math.random(),
      s: Math.random() * 0.02 + 0.004,
    }));

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.o += p.s;
        if (p.o > 1 || p.o < 0) p.s = -p.s;
        ctx.globalAlpha = Math.abs(p.o);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density, color, maxSize, minSize]);

  return <canvas ref={canvasRef} className={cn("h-full w-full", className)} />;
}
