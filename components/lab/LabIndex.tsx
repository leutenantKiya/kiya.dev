"use client";

import { useMemo, useState } from "react";
import { getLabEntries, type Artifact } from "@/lib/lab";
import { getAbout } from "@/lib/about";
import { useLanguage } from "@/components/providers/LanguageProvider";

const VISIBLE = 6;

const statusColor: Record<Artifact["status"], string> = {
  active: "bg-accent",
  done: "bg-text-2",
  archived: "bg-line",
};

function LabTile({ artifact }: { artifact: Artifact }) {
  const href = artifact.demo ?? artifact.repo ?? undefined;
  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex flex-col rounded-lg border border-line p-4 transition-colors duration-150 hover:border-text-2 hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
    >
      <div className="flex items-center gap-2 font-mono text-xs text-text-2">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusColor[artifact.status]}`} title={artifact.status} />
        <span>{artifact.year}</span>
        <span>· {artifact.type}</span>
        {href && <span className="ml-auto transition-colors group-hover:text-accent">↗</span>}
      </div>
      <h3 className="mt-2 text-base font-semibold tracking-tight text-text">{artifact.name}</h3>
      <p className="mt-1 text-sm text-text-2">{artifact.purpose}</p>
      <p className="mt-2 font-mono text-xs leading-relaxed text-accent">{artifact.insight}</p>
      <p className="mt-auto pt-3 font-mono text-xs text-text-2">{artifact.stack.join(" · ")}</p>
    </Wrapper>
  );
}

/** A filterable index instead of a marquee: readable, keyboard-friendly, and fine at 40 entries. */
export function LabIndex() {
  const { lang } = useLanguage();
  const entries = getLabEntries(lang);
  const about = getAbout(lang);
  const id = lang === "id";
  const [type, setType] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const types = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((e) => counts.set(e.type, (counts.get(e.type) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const filtered = (type === "all" ? entries : entries.filter((e) => e.type === type))
    .slice()
    .sort((a, b) => Number(b.year) - Number(a.year));
  const shown = showAll ? filtered : filtered.slice(0, VISIBLE);
  const hiddenCount = filtered.length - shown.length;

  const chip = (value: string, label: string, count: number) => (
    <button
      key={value}
      type="button"
      aria-pressed={type === value}
      onClick={() => {
        setType(value);
        setShowAll(false);
      }}
      className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent ${
        type === value ? "border-accent bg-surface-2 text-accent" : "border-line text-text-2 hover:text-text"
      }`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-text-2">{about.labLine}</p>

      <div role="group" aria-label={id ? "Saring berdasarkan jenis" : "Filter by type"} className="mb-4 flex flex-wrap gap-2">
        {chip("all", id ? "semua" : "all", entries.length)}
        {types.map(([t, n]) => chip(t, t, n))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((a) => (
          <LabTile key={a.name} artifact={a} />
        ))}
      </div>

      {(hiddenCount > 0 || showAll) && filtered.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="mt-4 rounded-full border border-line px-4 py-2 font-mono text-xs text-text-2 transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          {showAll
            ? id ? "Tampilkan lebih sedikit" : "Show fewer"
            : id ? `Tampilkan ${hiddenCount} lagi` : `Show ${hiddenCount} more`}
        </button>
      )}
    </div>
  );
}
