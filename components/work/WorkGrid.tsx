"use client";

import { useState } from "react";
import Link from "next/link";
import { getProjects, type Project } from "@/lib/projects";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { ProjectPreview } from "./ProjectPreview";

// Featured + this many more stay visible; the rest open behind "show all".
const VISIBLE = 5;
const STACK_SHOWN = 3;

function Stack({ items, limit }: { items: string[]; limit?: number }) {
  const shown = limit ? items.slice(0, limit) : items;
  const rest = items.length - shown.length;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
      {shown.map((tech) => (
        <li key={tech} className="rounded border border-line px-2 py-0.5 font-mono text-xs text-text-2">
          {tech}
        </li>
      ))}
      {rest > 0 && <li className="px-1 py-0.5 font-mono text-xs text-text-2">+{rest}</li>}
    </ul>
  );
}

function Still({ project, className }: { project: Project; className: string }) {
  const [hovered, setHovered] = useState(false);
  if (!project.preview && !project.previews?.length) return null;
  return (
    <div
      className={`overflow-hidden rounded-md border border-line bg-surface ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ProjectPreview
        preview={project.preview}
        previews={project.previews}
        alt={`Preview of ${project.title}`}
        className="h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
        isHovered={hovered}
      />
    </div>
  );
}

/** The flagship: screenshot and full story side by side. */
function Featured({ project, label }: { project: Project; label: string }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group grid gap-5 rounded-lg border border-line p-4 transition-colors duration-150 hover:border-text-2 hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent md:grid-cols-[1.15fr_1fr] md:gap-6 md:p-5"
    >
      <Still project={project} className="aspect-[8/5]" />
      <div className="flex flex-col">
        <span className="font-mono text-xs text-text-2">
          {project.year} · {project.status}
        </span>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          {project.title}
          <span className="ml-2 inline-block text-text-2 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent">
            →
          </span>
        </h3>
        <p className="mt-1 text-base text-text">{project.tagline}</p>
        <p className="mt-3 text-sm leading-relaxed text-text-2">{project.summary}</p>
        <div className="mt-auto pt-4">
          <Stack items={project.stack} />
          <span className="mt-4 inline-block font-mono text-xs text-accent">{label}</span>
        </div>
      </div>
    </Link>
  );
}

/** Everyone else: screenshot on top, one line of story, short stack. */
function Compact({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex flex-col rounded-lg border border-line p-4 transition-colors duration-150 hover:border-text-2 hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
    >
      <Still project={project} className="aspect-[8/5]" />
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight">
          {project.title}
          <span className="ml-2 inline-block text-text-2 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent">
            →
          </span>
        </h3>
        <span className="shrink-0 font-mono text-xs text-text-2">{project.year}</span>
      </div>
      <p className="mt-1 text-sm text-text-2">{project.tagline}</p>
      <div className="mt-auto pt-4">
        <Stack items={project.stack} limit={STACK_SHOWN} />
      </div>
    </Link>
  );
}

export function WorkGrid() {
  const { lang } = useLanguage();
  const projects = getProjects(lang);
  const [showAll, setShowAll] = useState(false);
  const [featured, ...rest] = projects;
  const shown = showAll ? rest : rest.slice(0, VISIBLE - 1);
  const hiddenCount = rest.length - shown.length;
  const id = lang === "id";

  if (!featured) return null;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Featured project={featured} label={id ? "Baca studi kasusnya" : "Read the case study"} />
      <div className="grid gap-4 sm:grid-cols-2">
        {shown.map((p) => (
          <Compact key={p.slug} project={p} />
        ))}
      </div>
      {(hiddenCount > 0 || showAll) && rest.length > VISIBLE - 1 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="w-fit rounded-full border border-line px-4 py-2 font-mono text-xs text-text-2 transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          {showAll
            ? id ? "Tampilkan lebih sedikit" : "Show fewer"
            : id ? `Lihat semua ${projects.length} proyek` : `Show all ${projects.length} projects`}
        </button>
      )}
    </div>
  );
}
