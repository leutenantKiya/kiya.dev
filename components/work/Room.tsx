"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

/**
 * One section of a case study as a room: the first 70% of its scroll moves the content into place,
 * the last 30% holds it still, and the title arrives on the hold. Below lg, or with reduced motion,
 * it is a plain section with the title always shown.
 */
export function Room({ title, children }: { title: string; children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [staged, setStaged] = useState(false);
  const [size, setSize] = useState({ content: 0, viewport: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setStaged(mq.matches && !reduced);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduced]);

  useEffect(() => {
    const el = stage.current;
    if (!staged || !el) return;
    const measure = () => setSize({ content: el.offsetHeight, viewport: window.innerHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [staged]);

  // 0 when the room's top meets the bottom of the screen, 1 when its bottom does. Measured by hand
  // (one rAF per scroll) so the hold maths below matches what the browser actually scrolls.
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const el = section.current;
    if (!staged || !el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const p = (window.innerHeight - rect.top) / rect.height;
      scrollYProgress.set(Math.min(1, Math.max(0, p)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [staged, scrollYProgress]);
  const y = useTransform(scrollYProgress, [0, 0.7, 1], ["14vh", "0vh", "0vh"]);
  const opacity = useTransform(scrollYProgress, [0, 0.45, 0.7], [0.2, 0.85, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.7, 0.8], [16, 0]);

  if (!staged) {
    // The ref stays attached in both modes, so the scroll tracker is bound from the first render.
    return (
      <section ref={section}>
        <h2>{title}</h2>
        {children}
      </section>
    );
  }

  // Extra scroll after the content so the hold is 30% of the room's scroll (0.3 / 0.7 of the content).
  const holdSpace = size.content * (0.3 / 0.7);
  // Progress runs from the room's top meeting the screen's bottom to its bottom meeting the screen's
  // bottom. At 70% the room's top sits at viewport - 0.7 * height: pin the content right there, so it
  // stays still for the last 30%. Never above the navbar.
  const top = Math.max(96, size.viewport - 0.7 * (size.content + holdSpace));

  return (
    <section ref={section}>
      <motion.div ref={stage} style={{ y, opacity, position: "sticky", top }}>
        <motion.h2 style={{ opacity: titleOpacity, y: titleY }}>{title}</motion.h2>
        {children}
      </motion.div>
      {/* The hold: empty scroll for the pinned content. A spacer, not padding, because a sticky element
          can't move into its parent's padding. */}
      <div aria-hidden data-room-hold style={{ height: holdSpace }} />
    </section>
  );
}
