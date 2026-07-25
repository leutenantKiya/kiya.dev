"use client";

import { useEffect, useRef } from "react";

/** Cursor companion: the jet chases the pointer with a lag (lerp), and
 *  mirrors itself to face the direction it is flying. Source image faces
 *  left, so moving left = normal, moving right = scaleX(-1).
 *  Desktop-pointer only; disabled for touch and reduced-motion. */
export function CursorJet({ src }: { src: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Start offscreen until the first mouse move
    let targetX = -300;
    let targetY = -300;
    let x = targetX;
    let y = targetY;
    let facing = 1; // 1 = left (natural), -1 = right (mirrored)
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      const dx = targetX - x;
      // Lerp = the "little bit of delay" — lower factor, longer chase
      x += dx * 0.07;
      y += (targetY - y) * 0.07;

      // Flip only on deliberate horizontal movement, not pixel jitter
      if (dx > 6) facing = -1;
      else if (dx < -6) facing = 1;

      const wrap = wrapRef.current;
      const img = imgRef.current;
      if (wrap && img) {
        // Offset so the jet doesn't sit directly under the pointer
        const offsetX = facing === 1 ? -90 : 30;
        const offsetY = -55;
        wrap.style.transform = `translate3d(${x + offsetX}px, ${y + offsetY}px, 0)`;
        img.style.transform = `scaleX(${facing})`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-40 hidden [@media(hover:hover)]:motion-safe:block"
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        width={96}
        height={64}
        className="w-24 transition-transform duration-300 ease-out"
        draggable={false}
      />
    </div>
  );
}
