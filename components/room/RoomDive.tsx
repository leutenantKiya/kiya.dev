"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSeasonal } from "@/components/providers/SeasonalProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { hasWebGL } from "@/components/seasonal/Seasonal3D";
import { getProjects } from "@/lib/projects";

const RoomScene = dynamic(() => import("./RoomScene"), { ssr: false });

const COPY = {
  en: {
    title: "Where it gets built",
    line: "My desk in Yogyakarta. Keep scrolling to go through the screen and into the work.",
    hint: "Play the piano, click the lamp, or open the poster.",
  },
  id: {
    title: "Tempat semuanya dibuat",
    line: "Meja kerjaku di Yogyakarta. Terus gulir untuk masuk lewat layar ke karya-karyaku.",
    hint: "Mainkan pianonya, klik lampunya, atau buka posternya.",
  },
};

/**
 * The scroll scene between the hero and the projects: Kiya's room in three.js (RoomScene). The stage
 * pins for a few screens while the camera flies from the whole room into the monitor, whose screen
 * then fades into the page so the projects section reads as what was on it. Under reduced motion the
 * stage does not pin and the camera holds one view.
 */
export function RoomDive() {
  const { lang } = useLanguage();
  const { reducedMotion } = useSeasonal();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const copy = COPY[lang === "id" ? "id" : "en"];

  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const textBlock = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  // The free part of the stage the room is fitted into at the start: beside the text on wide
  // screens, below it on narrow ones. In stage pixels.
  const frame = useRef({ left: 0, top: 0, right: 1, bottom: 1 });
  const [p, setP] = useState(0);
  const [near, setNear] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setWebgl(hasWebGL());
    setCompact(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  useEffect(() => {
    const el = stage.current;
    const text = textBlock.current;
    if (!el || !text) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const t = text.getBoundingClientRect();
      const w = box.width, h = box.height;
      const side = w >= 900 && w / h > 1.15;
      frame.current = side
        ? { left: t.right - box.left + 40, top: 80, right: w - 32, bottom: h - 28 }
        : { left: 12, top: t.bottom - box.top + 12, right: w - 12, bottom: h - 16 };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(text);
    return () => ro.disconnect();
  }, []);

  // Mount the canvas only once the section is close, so the hero loads alone.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      progress.current = 0.35;
      setP(0.35);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const value = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      progress.current = value;
      setP(value);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  const screens = useMemo(
    () =>
      getProjects(lang).flatMap((project) => {
        const image = Array.isArray(project.preview) ? project.preview[0] : project.preview;
        return image ? [{ title: project.title, image }] : [];
      }),
    [lang],
  );

  const handlers = useMemo(
    () => ({
      onPoster: () => router.push("/work/genesis-town"),
      onLamp: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      onMonitor: () => document.getElementById("work")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" }),
    }),
    [router, setTheme, resolvedTheme, reducedMotion],
  );

  const textOut = Math.min(1, Math.max(0, (p - 0.18) / 0.17));
  const screenIn = Math.min(1, Math.max(0, (p - 0.86) / 0.12));

  return (
    <section
      ref={section}
      id="room"
      aria-labelledby="room-title"
      className={reducedMotion ? "relative h-[90svh]" : "relative h-[220svh] md:h-[320svh]"}
    >
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden">
        {webgl && near && (
          <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
            <RoomScene
              progress={progress}
              frame={frame}
              screens={screens}
              reduced={reducedMotion}
              compact={compact}
              handlers={handlers}
              onReady={() => setReady(true)}
            />
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 top-24 mx-auto max-w-[1040px] px-5 lg:px-12"
          style={{ opacity: 1 - textOut, transform: `translateY(${textOut * -24}px)` }}
        >
          <div ref={textBlock} className="w-fit max-w-xl">
          <h2 id="room-title" className="text-4xl font-semibold tracking-tight text-text [text-wrap:balance] sm:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-md text-base text-text sm:text-lg">{copy.line}</p>
          {webgl && <p className="mt-3 max-w-md text-sm text-text-2">{copy.hint}</p>}
          </div>
        </div>

        {/* The screen fills the view, then becomes the page the projects sit on. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bg" style={{ opacity: screenIn }} />
      </div>
    </section>
  );
}
