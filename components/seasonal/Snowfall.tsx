"use client";

import { useEffect, useRef } from "react";

type Flake = { x: number; y: number; r: number; speed: number; phase: number };

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let raf = 0;
    let color = "rgb(255 255 255 / 0.75)";

    const readColor = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue("--snow")
        .trim();
      if (value) color = value;
    };

    const makeFlake = (anywhere: boolean): Flake => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : -4,
      r: 0.8 + Math.random() * 2,
      speed: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 768 ? 40 : 90;
      flakes = Array.from({ length: count }, () => makeFlake(true));
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (const f of flakes) {
        f.y += f.speed;
        f.phase += 0.01;
        const x = f.x + Math.sin(f.phase) * 14;
        if (f.y > height + 4) Object.assign(f, makeFlake(false));
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === "visible") raf = requestAnimationFrame(tick);
    };

    // Theme changes swap the --snow value.
    const observer = new MutationObserver(readColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    readColor();
    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", start);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
