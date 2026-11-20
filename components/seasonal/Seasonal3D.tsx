"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSeasonal } from "@/components/providers/SeasonalProvider";
import { useTranslation } from "@/hooks/useTranslation";

// three.js only loads in season, on the client.
const ChristmasTree = dynamic(() => import("./three/ChristmasTree"), { ssr: false });
const Snowman = dynamic(() => import("./three/Snowman"), { ssr: false });

let webglCache: boolean | null = null;
function hasWebGL() {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    webglCache = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

/** Flat tree for browsers without WebGL. */
function TreeFallback() {
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full">
      <rect x="90" y="215" width="20" height="30" fill="#78350f" />
      <path d="M100 30 L170 220 H30 Z" fill="#166534" />
      <path d="M100 30 L150 150 H50 Z" fill="#16a34a" />
      <path d="M100 30 L130 95 H70 Z" fill="#22c55e" />
      {[
        [80, 120, "var(--xmas-red)"], [120, 140, "var(--xmas-gold)"], [95, 175, "#60a5fa"],
        [140, 195, "var(--xmas-red)"], [62, 200, "var(--xmas-gold)"], [105, 85, "#f472b6"],
      ].map(([x, y, c], i) => (
        <circle key={i} className="bulb" cx={x} cy={y} r="6" fill={c as string} style={{ color: c as string, animationDelay: `${i * 0.3}s` }} />
      ))}
      <path d="M100 8 l6 14 15 1 -12 9 4 15 -13 -8 -13 8 4 -15 -12 -9 15 -1 Z" fill="var(--xmas-gold)" />
    </svg>
  );
}

function SnowmanFallback() {
  return (
    <svg viewBox="0 0 120 170" className="h-full w-full">
      <circle cx="60" cy="125" r="38" fill="#f8fafc" />
      <circle cx="60" cy="72" r="27" fill="#f8fafc" />
      <circle cx="60" cy="34" r="20" fill="#f8fafc" />
      <rect x="40" y="48" width="40" height="8" rx="4" fill="#dc2626" />
      <circle cx="53" cy="30" r="2.5" fill="#1c1917" />
      <circle cx="67" cy="30" r="2.5" fill="#1c1917" />
      <path d="M60 35 l14 3 -14 3 Z" fill="#f97316" />
      <rect x="44" y="4" width="32" height="14" fill="#1c1917" />
      <rect x="38" y="16" width="44" height="4" fill="#1c1917" />
    </svg>
  );
}

export function HeroTree() {
  const { mounted, festive } = useSeasonal();
  if (!mounted || !festive) return null;

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-0 right-0 z-10 h-[36vh] w-[58vw] sm:h-[46vh] sm:w-[38vw] lg:right-[10%] lg:h-[58vh] lg:w-[min(32vw,480px)]"
    >
      {hasWebGL() ? <ChristmasTree /> : <TreeFallback />}
    </motion.div>
  );
}

export function ContactSnowman() {
  const { mounted, festive } = useSeasonal();
  const { t } = useTranslation();
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    if (!talking) return;
    const id = setTimeout(() => setTalking(false), 2800);
    return () => clearTimeout(id);
  }, [talking]);

  if (!mounted || !festive) return null;

  return (
    <div className="relative h-44 w-32 shrink-0 sm:h-56 sm:w-40">
      {hasWebGL() ? (
        <Snowman onPoke={() => setTalking(true)} />
      ) : (
        <button type="button" onClick={() => setTalking(true)} aria-label={t("snowmanSays")} className="h-full w-full">
          <SnowmanFallback />
        </button>
      )}
      {talking && (
        <motion.p
          role="status"
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-6 right-0 whitespace-nowrap rounded-md border border-line bg-surface px-3 py-1.5 font-mono text-xs text-text shadow-lg"
        >
          {t("snowmanSays")}
        </motion.p>
      )}
    </div>
  );
}
