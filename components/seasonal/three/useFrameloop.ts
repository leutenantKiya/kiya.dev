"use client";

import { useEffect, useState, type RefObject } from "react";

/** Render every frame only while the canvas is on screen; one static frame under reduced motion. */
export function useFrameloop(
  ref: RefObject<HTMLElement | null>,
  reducedMotion: boolean,
): "always" | "demand" | "never" {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  if (reducedMotion) return "demand";
  return visible ? "always" : "never";
}
