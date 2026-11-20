"use client";

import { useState } from "react";
import { getExperiences } from "@/lib/experience";
import { useLanguage } from "@/components/providers/LanguageProvider";

const VISIBLE = 3;

/**
 * One line per role: who, what, when and a sentence. Highlights and stack open on demand,
 * so the timeline stays short as entries pile up.
 */
export function ExperienceTimeline() {
  const { lang } = useLanguage();
  const experience = getExperiences(lang);
  const id = lang === "id";
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? experience : experience.slice(0, VISIBLE);
  const hiddenCount = experience.length - shown.length;

  return (
    <div className="relative mt-6">
      <span aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-line" />

      <ol className="flex flex-col gap-6">
        {shown.map((entry) => (
          <li key={`${entry.org}-${entry.start}`} className="relative pl-6">
            <span aria-hidden className="absolute -left-[4.5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent" />

            <div className="flex flex-col gap-x-4 gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="text-base font-semibold tracking-tight">{entry.org}</h3>
              <span className="shrink-0 font-mono text-xs text-text-2">
                {entry.start}
                {entry.end !== entry.start && ` – ${entry.end}`} · {entry.type}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-xs text-accent">{entry.role}</p>
            <p className="mt-2 text-sm leading-relaxed text-text-2">{entry.summary}</p>

            <details className="group mt-2">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 font-mono text-xs text-text-2 transition-colors duration-150 hover:text-accent [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="inline-block transition-transform duration-200 group-open:rotate-90">
                  ›
                </span>
                {id ? "Detail" : "Details"}
              </summary>
              <ul className="mt-2 list-disc pl-5 text-sm text-text-2 marker:text-line">
                {entry.highlights.map((h) => (
                  <li key={h} className="mt-1">
                    {h}
                  </li>
                ))}
              </ul>
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Stack">
                {entry.stack.map((tech) => (
                  <li key={tech} className="rounded border border-line px-2 py-0.5 font-mono text-xs text-text-2">
                    {tech}
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ol>

      {(hiddenCount > 0 || showAll) && experience.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="ml-6 mt-6 rounded-full border border-line px-4 py-2 font-mono text-xs text-text-2 transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          {showAll
            ? id ? "Tampilkan lebih sedikit" : "Show fewer"
            : id ? `Tampilkan ${hiddenCount} lagi` : `Show ${hiddenCount} earlier`}
        </button>
      )}
    </div>
  );
}
