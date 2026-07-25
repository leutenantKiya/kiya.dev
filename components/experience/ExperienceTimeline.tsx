"use client";

import { useEffect, useRef } from "react";
import { createTimeline, utils } from "animejs";
import { getExperiences } from "@/lib/experience";
import { useLanguage } from "@/components/providers/LanguageProvider";

/** Experience reveal choreographed with an anime.js timeline */
export function ExperienceTimeline() {
  const { lang } = useLanguage();
  const experience = getExperiences(lang);

  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const line = lineRef.current;
    if (!root || !line) return;

    const dots = utils.$(".exp-dot") as HTMLElement[];
    const cards = utils.$(".exp-card") as HTMLElement[];

    // Reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      utils.set(line, { scaleY: 1 });
      utils.set([...dots, ...cards], { opacity: 1, y: 0, scale: 1 });
      return;
    }

    utils.set(line, { scaleY: 0 });
    utils.set(dots, { opacity: 0, scale: 0 });
    utils.set(cards, { opacity: 0, y: 24 });

    let tl: ReturnType<typeof createTimeline> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || tl) return;
        observer.disconnect();

        tl = createTimeline({ defaults: { duration: 900, ease: "outExpo" } });

        tl.label("start").add(
          line,
          { scaleY: [0, 1], duration: 1400, ease: "inOutQuad" },
          "start",
        );

        dots.forEach((dot, i) => {
          const dotAt = 300 + i * 260;
          tl!
            .add(
              dot,
              { opacity: [0, 1], scale: [0, 1], duration: 500, ease: "outBack" },
              `start+=${dotAt}`,
            )
            .add(
              cards[i],
              { opacity: [0, 1], y: [28, 0] },
              `start+=${dotAt + 120}`,
            );
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      tl?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative mt-6">
      <span
        ref={lineRef}
        aria-hidden
        className="absolute left-0 top-0 h-full w-px origin-top bg-line"
      />

      <ol>
        {experience.map((entry) => (
          <li
            key={`${entry.org}-${entry.start}`}
            className="relative pb-10 pl-6 last:pb-0"
          >
            <span
              aria-hidden
              className="exp-dot absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent"
            />

            <div className="exp-card">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-base font-semibold tracking-tight">
                  {entry.org}
                </h3>
                <span className="font-mono text-xs text-text-2">
                  {entry.start}
                  {entry.end !== entry.start && ` — ${entry.end}`} · {entry.type}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-accent">{entry.role}</p>
              <p className="mt-2 text-sm leading-relaxed text-text-2">
                {entry.summary}
              </p>

              <ul className="mt-2 list-disc pl-5 text-sm text-text-2 marker:text-line">
                {entry.highlights.map((h) => (
                  <li key={h} className="mt-1">
                    {h}
                  </li>
                ))}
              </ul>

              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Stack">
                {entry.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded border border-line px-2 py-0.5 font-mono text-xs text-text-2"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
