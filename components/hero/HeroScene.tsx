/**
 * The cozy backdrop behind the hero. With WebGL it is the three.js valley (three/SkyScene), where a
 * theme switch plays a sunset or sunrise. The SVG below is the flat version of the same valley: it shows
 * before the canvas is up and in browsers without WebGL. Light theme is day, dark theme is night;
 * holiday mode adds snow. Colours come from --scene-* tokens in globals.css, and the layers drift with
 * the scroll (--hp).
 */

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { hasWebGL } from "@/components/seasonal/Seasonal3D";

const SkyScene = dynamic(() => import("./three/SkyScene"), { ssr: false });

const STARS = [
  [80, 60, 1.6], [190, 140, 1.1], [300, 40, 1.4], [420, 110, 1], [520, 70, 1.8], [640, 30, 1.2],
  [760, 120, 1], [880, 50, 1.5], [990, 95, 1.1], [1110, 35, 1.7], [1230, 130, 1], [1340, 70, 1.3],
  [1450, 40, 1.1], [1540, 110, 1.6], [130, 230, 1], [360, 200, 1.2], [700, 210, 1], [1020, 190, 1.3],
  [1290, 220, 1], [1500, 250, 1.2],
] as const;

const HOUSES = [
  { x: 1090, y: 664, w: 64, h: 44 },
  { x: 1170, y: 676, w: 52, h: 36 },
  { x: 1240, y: 658, w: 72, h: 50 },
  { x: 600, y: 712, w: 50, h: 34 },
];

const PINES = [
  [960, 690, 46], [1010, 700, 36], [1330, 676, 54], [1390, 690, 40], [1440, 700, 48],
  [240, 714, 44], [290, 724, 34], [470, 716, 40], [180, 728, 30], [1490, 712, 34],
];

export function HeroScene() {
  // The three.js valley takes over once its canvas is up; this drawing stays for no-WebGL browsers
  // and for the moment before the canvas loads.
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setWebgl(hasWebGL()), []);

  return (
    <div aria-hidden className="hero-scene pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {webgl && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <SkyScene onReady={() => setReady(true)} />
        </div>
      )}
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className={`h-full w-full ${ready ? "invisible" : ""}`}>
        <defs>
          <linearGradient id="sky-day" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fcdf2" />
            <stop offset="0.65" stopColor="#dcecf8" />
            <stop offset="1" stopColor="#fbefdc" />
          </linearGradient>
          <linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#070b1e" />
            <stop offset="0.6" stopColor="#151634" />
            <stop offset="1" stopColor="#2a1a36" />
          </linearGradient>
          <radialGradient id="sun-glow">
            <stop offset="0" stopColor="#fff4c4" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff4c4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moon-glow">
            <stop offset="0" stopColor="#f6efd8" stopOpacity="0.35" />
            <stop offset="1" stopColor="#f6efd8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="window-glow">
            <stop offset="0" stopColor="#ffc865" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffc865" stopOpacity="0" />
          </radialGradient>
          <mask id="moon-crescent">
            <rect width="1600" height="900" fill="#fff" />
            <circle cx="1306" cy="160" r="36" fill="#000" />
          </mask>
        </defs>

        {/* sky: day and night crossfade */}
        <rect className="scene-day" width="1600" height="900" fill="url(#sky-day)" />
        <rect className="scene-night" width="1600" height="900" fill="url(#sky-night)" />

        {/* sun by day, moon and stars by night */}
        <g className="scene-day scene-far">
          <circle cx="1290" cy="190" r="150" fill="url(#sun-glow)" />
          <circle cx="1290" cy="190" r="46" fill="#ffe7a1" />
        </g>
        <g className="scene-night scene-far">
          <circle cx="1290" cy="170" r="140" fill="url(#moon-glow)" />
          <circle cx="1290" cy="170" r="40" fill="#f3ead2" mask="url(#moon-crescent)" />
          {STARS.map(([x, y, r], i) => (
            <circle key={i} className="scene-star" cx={x} cy={y} r={r} fill="#fdf8e8" style={{ animationDelay: `${(i * 0.37) % 3}s` }} />
          ))}
        </g>

        {/* clouds drift by day, thin out at night */}
        <g className="scene-clouds scene-far">
          <g className="scene-cloud" style={{ animationDuration: "90s" }}>
            <ellipse cx="260" cy="290" rx="110" ry="26" />
            <ellipse cx="320" cy="276" rx="70" ry="30" />
          </g>
          <g className="scene-cloud" style={{ animationDuration: "120s", animationDelay: "-40s" }}>
            <ellipse cx="900" cy="230" rx="130" ry="24" />
            <ellipse cx="960" cy="216" rx="80" ry="28" />
          </g>
        </g>

        {/* far mountains, with snowy caps in holiday mode */}
        <g className="scene-far">
          <path className="scene-mountain-far" d="M0 640 L180 470 L300 560 L470 400 L640 560 L780 450 L960 590 L1130 430 L1290 560 L1450 460 L1600 560 L1600 900 L0 900 Z" />
          <path className="scene-snowcap" d="M470 400 L430 440 L455 436 L475 452 L500 432 L512 440 Z M1130 430 L1092 468 L1118 462 L1136 478 L1158 458 L1170 466 Z M180 470 L150 500 L172 496 L186 508 L204 492 Z M1450 460 L1420 488 L1442 484 L1456 496 L1474 480 Z" />
        </g>

        {/* rolling hills */}
        <g className="scene-mid">
          <path className="scene-hill-back" d="M0 700 C200 620 380 640 560 680 C760 724 900 640 1100 630 C1300 620 1440 660 1600 640 L1600 900 L0 900 Z" />
        </g>

        {/* the village and pines on the near hill */}
        <g className="scene-near">
          <path className="scene-hill-front" d="M0 740 C220 690 420 700 620 740 C820 780 1000 690 1220 680 C1400 672 1500 700 1600 690 L1600 900 L0 900 Z" />
          {PINES.map(([x, y, h], i) => (
            <path key={i} className="scene-pine" d={`M${x} ${y - h} L${x - h * 0.42} ${y} L${x + h * 0.42} ${y} Z`} />
          ))}
          {HOUSES.map((house, i) => (
            <g key={i}>
              <rect className="scene-house" x={house.x} y={house.y} width={house.w} height={house.h} rx="2" />
              <path className="scene-roof" d={`M${house.x - 6} ${house.y + 2} L${house.x + house.w / 2} ${house.y - house.h * 0.55} L${house.x + house.w + 6} ${house.y + 2} Z`} />
              <path className="scene-roof-snow" d={`M${house.x + house.w * 0.18} ${house.y - house.h * 0.32} L${house.x + house.w / 2} ${house.y - house.h * 0.55} L${house.x + house.w * 0.82} ${house.y - house.h * 0.32} Z`} />
              <circle className="scene-night" cx={house.x + house.w / 2} cy={house.y + house.h / 2} r={house.w * 0.9} fill="url(#window-glow)" />
              <rect className="scene-window" x={house.x + house.w * 0.2} y={house.y + house.h * 0.32} width={house.w * 0.22} height={house.h * 0.3} />
              <rect className="scene-window" x={house.x + house.w * 0.58} y={house.y + house.h * 0.32} width={house.w * 0.22} height={house.h * 0.3} />
              {i % 2 === 0 && (
                <>
                  <rect className="scene-chimney" x={house.x + house.w * 0.7} y={house.y - house.h * 0.5} width="7" height={house.h * 0.3} />
                  <circle className="scene-smoke" cx={house.x + house.w * 0.7 + 3.5} cy={house.y - house.h * 0.55} r="6" style={{ animationDelay: `${i * 0.8}s` }} />
                  <circle className="scene-smoke" cx={house.x + house.w * 0.7 + 3.5} cy={house.y - house.h * 0.55} r="6" style={{ animationDelay: `${i * 0.8 + 1.6}s` }} />
                </>
              )}
            </g>
          ))}
        </g>

      </svg>
    </div>
  );
}
