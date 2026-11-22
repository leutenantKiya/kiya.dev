"use client";

import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { useTranslation } from "@/hooks/useTranslation";

const FLIGHT_SECONDS = 16;

function Reindeer({ x, nose }: { x: number; nose?: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* antlers */}
      <path d="M30 6 l-4 -8 M30 6 l3 -9 M27 1 l-5 -2 M32 0 l4 -3" stroke="#7c4a24" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* body, neck, head */}
      <ellipse cx="14" cy="20" rx="14" ry="7" fill="#8b5a2b" />
      <path d="M24 16 q4 -6 6 -10" stroke="#8b5a2b" strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="33" cy="7" rx="5.5" ry="4" fill="#8b5a2b" />
      <circle cx="38" cy="8" r="2.2" fill={nose ? "#ef4444" : "#3f2a17"}>
        {nose && <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />}
      </circle>
      {/* legs, galloping */}
      <path d="M4 25 l-6 6 M10 26 l-3 8 M20 26 l6 6 M25 24 l8 4" stroke="#7c4a24" strokeWidth="2.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="-6 14 22;6 14 22;-6 14 22" dur="0.5s" repeatCount="indefinite" />
      </path>
      <ellipse cx="2" cy="17" rx="3" ry="2" fill="#f5f5f4" />
    </g>
  );
}

function Sleigh() {
  return (
    <svg viewBox="0 0 230 70" className="h-full w-full overflow-visible" aria-hidden>
      {/* reins */}
      <path d="M78 34 Q120 30 150 22 Q170 18 182 16" stroke="#d6d3d1" strokeWidth="1.2" fill="none" />
      {/* sleigh */}
      <path d="M8 58 Q4 64 14 64 H74 Q84 64 86 54" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M12 30 H66 Q80 30 80 44 V54 H18 Q10 54 10 44 Z" fill="#dc2626" />
      <path d="M12 30 H66" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      {/* gift sack */}
      <path d="M14 30 Q12 10 26 8 Q36 12 34 30 Z" fill="#a16207" />
      <rect x="20" y="16" width="9" height="9" fill="#22c55e" rx="1" />
      {/* Santa */}
      <circle cx="54" cy="22" r="9" fill="#dc2626" />
      <circle cx="54" cy="12" r="6" fill="#fcd9b6" />
      <path d="M48 13 Q54 26 60 13 Q57 18 54 18 Q51 18 48 13 Z" fill="#fafaf9" />
      <path d="M47 9 Q54 -2 62 6 L66 10" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="67" cy="11" r="2.5" fill="#fafaf9" />
      <rect x="47" y="7.5" width="14" height="3" rx="1.5" fill="#fafaf9" />
      <path d="M62 24 Q70 28 78 33" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
      {/* reindeer pulling */}
      <g transform="translate(118 14)">
        <Reindeer x={0} />
      </g>
      <g transform="translate(160 6)">
        <Reindeer x={0} nose />
      </g>
    </svg>
  );
}

export function SantaSleigh() {
  const { t } = useTranslation();
  const controls = useAnimationControls();
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const fly = async () => {
      if (cancelled) return;
      const w = window.innerWidth;
      const top = window.innerHeight * (0.08 + Math.random() * 0.14);
      await controls.set({ x: -280, y: top, opacity: 1 });
      await controls.start({
        x: w + 40,
        y: [top, top - 40, top + 10, top - 30, top],
        transition: { duration: FLIGHT_SECONDS, ease: "linear" },
      });
    };

    timer = setTimeout(fly, 3500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controls.stop();
    };
  }, [controls]);

  useEffect(() => {
    if (!talking) return;
    const id = setTimeout(() => setTalking(false), 3200);
    return () => clearTimeout(id);
  }, [talking]);

  return (
    <motion.div
      animate={controls}
      initial={{ x: -280, opacity: 0 }}
      className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[230px] sm:block"
    >
      <button
        type="button"
        onClick={() => setTalking(true)}
        aria-label={t("santaSays")}
        className="pointer-events-auto block h-[70px] w-[230px] -rotate-3"
      >
        <Sleigh />
      </button>
      {talking && (
        <motion.p
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-10 left-6 whitespace-nowrap rounded-md border border-line bg-surface px-3 py-1.5 font-mono text-xs text-text shadow-lg"
        >
          {t("santaSays")}
        </motion.p>
      )}
    </motion.div>
  );
}
