"use client";

import { useEffect, useRef } from "react";
import { useSeasonal } from "@/components/providers/SeasonalProvider";

// Old C9 string: big tungsten bulbs in five colours.
const COLORS = ["#ff3b30", "#ffb02e", "#2f7bff", "#27c46b", "#ff5fa2"];
const SWOOPS = 3;
const BULBS_PER_SWOOP = 7;

/** A string of lights draped across the top of the hero. Bulbs glow harder on the beat. */
export function Garland() {
  const { mounted, festive, levelRef } = useSeasonal();
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!mounted || !festive) return;
    let raf = 0;
    const tick = () => {
      ref.current?.style.setProperty("--beat", (levelRef.current ?? 0).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted, festive, levelRef]);

  if (!mounted || !festive) return null;

  const width = 1000;
  const sag = 34;
  const span = width / SWOOPS;
  const wire = Array.from({ length: SWOOPS }, (_, s) => {
    const x0 = s * span;
    return `${s === 0 ? `M${x0} 4` : ""} Q${x0 + span / 2} ${4 + sag * 2} ${x0 + span} 4`;
  }).join(" ");

  const bulbs = Array.from({ length: SWOOPS * BULBS_PER_SWOOP }, (_, i) => {
    const s = Math.floor(i / BULBS_PER_SWOOP);
    const u = ((i % BULBS_PER_SWOOP) + 0.5) / BULBS_PER_SWOOP;
    // Point on the quadratic curve at u.
    const x = s * span + u * span;
    const y = 4 + 2 * u * (1 - u) * sag * 2;
    return { x, y, color: COLORS[i % COLORS.length], delay: (i * 0.23) % 1.8 };
  });

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox={`0 0 ${width} 90`}
      preserveAspectRatio="none"
      className="garland pointer-events-none absolute inset-x-0 top-0 z-20 h-12 w-full lg:top-[52px] lg:h-16"
    >
      <path d={wire} fill="none" stroke="var(--text-2)" strokeOpacity="0.5" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      {bulbs.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y})`}>
          <rect x="-3" y="-1" width="6" height="6" rx="1" fill="#2b3a2b" />
          <path
            className="bulb"
            d="M-5 6 C-6 13 -3 20 0 23 C3 20 6 13 5 6 Z"
            fill="currentColor"
            style={{ color: b.color, animationDelay: `${b.delay}s` }}
          />
        </g>
      ))}
    </svg>
  );
}

export function SantaHat() {
  const { mounted, festive } = useSeasonal();
  if (!mounted || !festive) return null;

  return (
    <svg
      aria-hidden
      viewBox="0 0 40 32"
      className="santa-hat pointer-events-none absolute -top-3.5 left-[3px] h-4 w-5"
    >
      <path d="M4 26 Q10 4 28 6 Q34 8 35 20 L30 16 Q24 12 18 26 Z" fill="var(--xmas-red)" />
      <rect x="2" y="23" width="22" height="6" rx="3" fill="#fafaf9" />
      <circle cx="35" cy="21" r="4" fill="#fafaf9" />
    </svg>
  );
}
