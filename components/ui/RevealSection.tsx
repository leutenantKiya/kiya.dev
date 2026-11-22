"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Each section rises into place once, the first time it scrolls into view, and then stays put.
 *  The motion lives in CSS (.reveal in globals.css) so every section shares one duration and easing;
 *  reduced motion shows everything at once. */
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
    // Any overlap counts (not a share of the section), so sections taller than the screen still reveal.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.shown = "";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={`reveal ${className ?? ""}`}>
      {children}
    </section>
  );
}
