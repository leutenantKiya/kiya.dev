"use client";

import { useEffect, useRef, useState } from "react";
import { experience } from "@/lib/experience";

/** Timeline entries reveal one after another once the section scrolls into view. */
export function ExperienceTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={ref} className="mt-6 border-l border-line">
      {experience.map((entry, i) => (
        <li
          key={`${entry.org}-${entry.start}`}
          className="relative pb-10 pl-6 last:pb-0"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "none" : "translateY(10px)",
            transition: `opacity 500ms ease ${i * 180}ms, transform 500ms ease ${i * 180}ms`,
          }}
        >
          {/* Timeline dot */}
          <span
            aria-hidden
            className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent"
          />

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-base font-semibold tracking-tight">{entry.org}</h3>
            <span className="font-mono text-xs text-text-2">
              {entry.start}
              {entry.end !== entry.start && ` — ${entry.end}`} · {entry.type}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-xs text-accent">{entry.role}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-2">{entry.summary}</p>

          <ul className="mt-2 list-disc pl-5 text-sm text-text-2 marker:text-line">
            {entry.highlights.map((h) => (
              <li key={h} className="mt-1">{h}</li>
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
        </li>
      ))}
    </ol>
  );
}
