"use client";

import { useState } from "react";
import { getExperiences, type Experience } from "@/lib/experience";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTranslation } from "@/hooks/useTranslation";

type Lane = { id: string; en: string; id_: string; short: [string, string]; types: Experience["type"][]; tone: string };

// Things that run at the same time sit side by side, like a rundown: one lane per kind of work,
// each with its own colour (the bars, the dot in the header and the details card share it).
const LANES: Lane[] = [
  { id: "work", en: "Work", id_: "Kerja", short: ["Work", "Kerja"], types: ["work"], tone: "var(--color-accent)" },
  { id: "study", en: "Study", id_: "Studi", short: ["Study", "Studi"], types: ["education"], tone: "var(--lane-study)" },
  { id: "projects", en: "Projects and events", id_: "Proyek dan acara", short: ["Projects", "Proyek"], types: ["project", "hackathon", "organization"], tone: "var(--lane-project)" },
];

const KIND: Record<Experience["type"], [string, string]> = {
  work: ["Work", "Kerja"],
  education: ["Study", "Studi"],
  project: ["Project", "Proyek"],
  hackathon: ["Hackathon", "Hackathon"],
  organization: ["Organization", "Organisasi"],
};

// Row height comes from --row so phones get shorter years than desktop.
const ROW = "var(--row)";

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

function Details({ entry, span }: { entry: Entry; span: string }) {
  const { lang } = useLanguage();
  return (
    <div className="animate-rise grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: laneOf(entry).tone }}>
          {KIND[entry.type][lang === "id" ? 1 : 0]} · {span}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl [text-wrap:balance]">{entry.org}</h3>
        <p className="mt-1 text-sm text-text-2">{entry.role}</p>
        <p className="mt-4 text-base leading-relaxed text-text [text-wrap:pretty]">{entry.summary}</p>
      </div>
      <div>
        <ol className="space-y-3">
          {entry.highlights.map((h, i) => (
            <li key={h} className="flex gap-3 text-sm leading-relaxed text-text-2">
              <span className="mt-0.5 shrink-0 font-mono text-[11px] text-text-2/70">{String(i + 1).padStart(2, "0")}</span>
              <span>{h}</span>
            </li>
          ))}
        </ol>
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={lang === "id" ? "Teknologi" : "Stack"}>
          {entry.stack.map((tech) => (
            <li key={tech} className="rounded-full border border-line bg-bg px-2.5 py-0.5 font-mono text-xs text-text-2">
              {tech}
            </li>
          ))}
        </ul>
      </div>
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
  // Newest first, for stepping through with the arrows.
  const order = [...entries].sort((a, b) => b.from - a.from || b.to - a.to);
  const [selected, setSelected] = useState<string>(order[0]?.key ?? "");
  const current = entries.find((e) => e.key === selected) ?? order[0];
  const index = order.findIndex((e) => e.key === current?.key);
  const step = (d: number) => setSelected(order[(index + d + order.length) % order.length].key);
  const label = (l: Lane) => (lang === "id" ? l.id_ : l.en);
  const nowLabel = lang === "id" ? "sekarang" : "now";
  const span = (e: Entry) => `${e.start}${e.ongoing ? ` – ${nowLabel}` : e.end !== e.start ? ` – ${e.end}` : ""}`;

  return (
    <div className="mt-4">
      <p className="mb-8 max-w-[60ch] text-base text-text-2">{t("sectionExperience")}</p>

      {/* the rundown grid on every width: time running down, lanes across */}
      <div className="exp-grid">
        <div className="grid gap-x-1.5 sm:gap-x-3" style={{ gridTemplateColumns: `2.5rem ${lanes.map((l) => `minmax(0, ${l.slotCount}fr)`).join(" ")}` }}>
          <div />
          {lanes.map(({ lane, placed }) => (
            <p key={lane.id} className="flex items-center gap-1.5 pb-3 font-mono text-[11px] text-text-2 sm:text-xs">
              <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: lane.tone }} />
              <span className="sm:hidden">{lane.short[lang === "id" ? 1 : 0]}</span>
              <span className="hidden sm:inline">{label(lane)}</span>
              <span className="hidden text-text-2/60 sm:inline">{placed.length}</span>
            </p>
          ))}

          <div className="grid" style={{ gridTemplateRows: `repeat(${years.length}, ${ROW})` }}>
            {years.map((y) => (
              <p key={y} className={`border-t pt-1.5 font-mono text-[11px] sm:text-sm ${y === now ? "border-accent text-accent" : "border-line text-text-2"}`}>
                {y}
                {y === now && (
                  <span className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-widest">
                    <span aria-hidden className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                    </span>
                    {nowLabel}
                  </span>
                )}
              </p>
            ))}
          </div>

          {lanes.map(({ lane, placed, slotCount }) => (
            <ul
              key={lane.id}
              aria-label={label(lane)}
              className="grid gap-1 border-t border-line pt-1.5 sm:gap-1.5"
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
                      style={{ ["--tone" as string]: lane.tone }}
                      className={`exp-bar flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border border-l-[3px] p-2 text-left sm:p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        active ? "is-active" : ""
                      } ${e.ongoing ? "is-ongoing" : ""}`}
                    >
                      <span>
                        <span className="hidden font-mono text-[10px] uppercase tracking-widest text-[color:var(--tone)] sm:block">
                          {KIND[e.type][lang === "id" ? 1 : 0]}
                        </span>
                        <span className="line-clamp-4 block text-xs font-semibold leading-snug text-text [overflow-wrap:anywhere] sm:mt-0.5 sm:text-sm">{e.org}</span>
                        <span className="mt-0.5 hidden text-xs text-text-2 lg:line-clamp-2">{e.role}</span>
                      </span>
                      <span className="font-mono text-[10px] leading-tight text-text-2 sm:text-[11px]">
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
          <div
            id="experience-details"
            className="relative mt-8 overflow-hidden rounded-2xl border border-line bg-surface p-5 sm:p-8"
            style={{ boxShadow: `inset 4px 0 0 ${laneOf(current).tone}` }}
          >
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-line pb-4">
              <p className="font-mono text-xs text-text-2" aria-live="polite">
                {String(index + 1).padStart(2, "0")} / {String(order.length).padStart(2, "0")}
              </p>
              <div className="flex gap-2">
                {[
                  [-1, lang === "id" ? "Sebelumnya" : "Previous", "←"],
                  [1, lang === "id" ? "Berikutnya" : "Next", "→"],
                ].map(([d, name, arrow]) => (
                  <button
                    key={name as string}
                    type="button"
                    aria-label={name as string}
                    onClick={() => step(d as number)}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-line text-text transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {arrow}
                  </button>
                ))}
              </div>
            </div>
            <Details key={current.key} entry={current} span={span(current)} />
          </div>
        )}
      </div>
    </div>
  );
}
