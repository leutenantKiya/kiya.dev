"use client";

import { useState } from "react";
import { getExperiences, type Experience } from "@/lib/experience";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTranslation } from "@/hooks/useTranslation";

type Lane = { id: string; en: string; id_: string; types: Experience["type"][]; bar: string };

// Things that run at the same time sit side by side, like a rundown: one lane per kind of work.
const LANES: Lane[] = [
  { id: "work", en: "Work", id_: "Kerja", types: ["work"], bar: "border-accent/60 bg-accent/10" },
  { id: "study", en: "Study", id_: "Studi", types: ["education"], bar: "border-line bg-surface-2" },
  { id: "projects", en: "Projects and events", id_: "Proyek dan acara", types: ["project", "hackathon", "organization"], bar: "border-line bg-surface" },
];

const ROW = "8.5rem";

type Entry = Experience & { key: string; from: number; to: number; ongoing: boolean };
type Placed = Entry & { slot: number };

function laneOf(e: Experience) {
  return LANES.find((l) => l.types.includes(e.type)) ?? LANES[2];
}

/** Greedy interval packing: an entry takes the first slot in its lane that is free for all its years. */
function pack(items: Entry[]) {
  const slots: number[] = [];
  const placed: Placed[] = [];
  for (const it of [...items].sort((a, b) => a.from - b.from || b.to - a.to)) {
    let slot = slots.findIndex((freeFrom) => freeFrom <= it.from);
    if (slot === -1) slot = slots.length;
    slots[slot] = it.to + 1;
    placed.push({ ...it, slot });
  }
  return { placed, slotCount: Math.max(1, slots.length) };
}

function Details({ entry }: { entry: Entry }) {
  const { lang } = useLanguage();
  return (
    <div className="animate-rise">
      <div className="flex flex-col gap-x-4 gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-text">{entry.org}</h3>
        <span className="shrink-0 font-mono text-xs text-text-2">
          {entry.start}
          {entry.end !== entry.start && ` – ${entry.end}`}
        </span>
      </div>
      <p className="mt-0.5 font-mono text-xs text-accent">{entry.role}</p>
      <p className="mt-3 text-base leading-relaxed text-text">{entry.summary}</p>
      <ul className="mt-3 list-disc pl-5 text-sm text-text-2 marker:text-line">
        {entry.highlights.map((h) => (
          <li key={h} className="mt-1">
            {h}
          </li>
        ))}
      </ul>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={lang === "id" ? "Teknologi" : "Stack"}>
        {entry.stack.map((tech) => (
          <li key={tech} className="rounded border border-line px-2 py-0.5 font-mono text-xs text-text-2">
            {tech}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExperienceTimeline() {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const now = new Date().getFullYear();

  const entries: Entry[] = getExperiences(lang).map((e, i) => {
    const ongoing = e.end === "present" || e.end === "sekarang";
    return { ...e, key: `${e.org}-${e.start}-${i}`, from: Number(e.start), to: ongoing ? now : Number(e.end), ongoing };
  });
  const first = Math.min(...entries.map((e) => e.from));
  const last = Math.max(now, ...entries.map((e) => e.to));
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);

  const lanes = LANES.map((lane) => ({ lane, ...pack(entries.filter((e) => laneOf(e) === lane)) }));
  const [selected, setSelected] = useState<string>(entries[0]?.key ?? "");
  const current = entries.find((e) => e.key === selected) ?? entries[0];
  const label = (l: Lane) => (lang === "id" ? l.id_ : l.en);
  const nowLabel = lang === "id" ? "sekarang" : "now";
  const span = (e: Entry) => `${e.start}${e.ongoing ? ` – ${nowLabel}` : e.end !== e.start ? ` – ${e.end}` : ""}`;

  return (
    <div className="mt-4">
      <p className="mb-8 max-w-[60ch] text-base text-text-2">{t("sectionExperience")}</p>

      {/* tablet and up: the rundown grid, time running down, lanes across */}
      <div className="hidden md:block">
        <div className="grid gap-x-3" style={{ gridTemplateColumns: `3.5rem ${lanes.map((l) => `minmax(0, ${l.slotCount}fr)`).join(" ")}` }}>
          <div />
          {lanes.map(({ lane }) => (
            <p key={lane.id} className="pb-2 font-mono text-xs text-text-2">
              {label(lane)}
            </p>
          ))}

          <div className="grid" style={{ gridTemplateRows: `repeat(${years.length}, ${ROW})` }}>
            {years.map((y) => (
              <p key={y} className="border-t border-line pt-1.5 font-mono text-xs text-text-2">
                {y}
              </p>
            ))}
          </div>

          {lanes.map(({ lane, placed, slotCount }) => (
            <ul
              key={lane.id}
              aria-label={label(lane)}
              className="grid gap-1.5 border-t border-line pt-1.5"
              style={{
                gridTemplateRows: `repeat(${years.length}, ${ROW})`,
                gridTemplateColumns: `repeat(${slotCount}, minmax(0, 1fr))`,
              }}
            >
              {placed.map((e) => {
                const active = current?.key === e.key;
                return (
                  <li key={e.key} style={{ gridRow: `${e.from - first + 1} / ${e.to - first + 2}`, gridColumn: e.slot + 1 }}>
                    <button
                      type="button"
                      aria-pressed={active}
                      aria-controls="experience-details"
                      onClick={() => setSelected(e.key)}
                      className={`flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border p-3 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${lane.bar} ${
                        active ? "ring-2 ring-accent" : "hover:border-text-2"
                      } ${e.ongoing ? "rounded-b-none border-b-2 border-b-accent" : ""}`}
                    >
                      <span>
                        <span className="block text-sm font-semibold leading-snug text-text">{e.org}</span>
                        <span className="mt-0.5 block text-xs text-text-2">{e.role}</span>
                      </span>
                      <span className="font-mono text-[11px] text-text-2">
                        {span(e)}
                        {e.ongoing && " ↓"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>

        {current && (
          <div id="experience-details" aria-live="polite" className="mt-6 rounded-xl border border-line bg-surface p-6">
            <Details key={current.key} entry={current} />
          </div>
        )}
      </div>

      {/* phone: the same entries as a list by the year they started, newest first */}
      <div className="md:hidden">
        {[...years].reverse().map((y) => {
          const started = entries.filter((e) => e.from === y);
          if (started.length === 0) return null;
          return (
            <section key={y} aria-label={String(y)} className="mb-6">
              <h3 className="mb-2 font-mono text-xs text-text-2">{y}</h3>
              <ol className="flex flex-col gap-2">
                {started.map((e) => (
                  <li key={e.key} className="rounded-lg border border-line bg-surface p-4">
                    <p className="font-mono text-[11px] text-text-2">
                      {label(laneOf(e))} · {span(e)}
                    </p>
                    <p className="mt-1 text-base font-semibold tracking-tight text-text">{e.org}</p>
                    <p className="font-mono text-xs text-accent">{e.role}</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-2">{e.summary}</p>
                    <details className="group mt-1">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-mono text-xs text-text-2 hover:text-accent [&::-webkit-details-marker]:hidden">
                        <span aria-hidden className="inline-block transition-transform duration-200 group-open:rotate-90">
                          ›
                        </span>
                        {lang === "id" ? "Detail" : "Details"}
                      </summary>
                      <ul className="mt-1 list-disc pl-5 text-sm text-text-2 marker:text-line">
                        {e.highlights.map((h) => (
                          <li key={h} className="mt-1">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
