"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, utils } from "animejs";

/** Scroll-driven reveal, one consistent stream across every section:
 *  enters from the bottom, dissipates to the top on leave. Driven by anime.js.
 *  Honors prefers-reduced-motion (content just stays visible). */
export function RevealSection({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    let shown = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !shown) {
            shown = true;
            // Cancel any in-flight leave so the two don't fight over opacity
            utils.remove(el);
            animate(el, {
              y: [40, 0],
              opacity: [0, 1],
              duration: 700,
              ease: "outExpo",
            });
          } else if (!entry.isIntersecting && shown) {
            shown = false;
            utils.remove(el);
            animate(el, {
              y: [0, -40],
              opacity: [1, 0],
              duration: 450,
              ease: "inQuad",
            });
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={className} style={{ opacity: 0 }}>
      {children}
    </section>
  );
}
