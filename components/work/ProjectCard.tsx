"use client";

import { useState } from "react";
import Link from "next/link";
import { getProject, type Project } from "@/lib/projects";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { ProjectPreview } from "./ProjectPreview";

export function ProjectCard({ project: rawProject }: { project: Project }) {
  const { lang } = useLanguage();
  const project = getProject(rawProject.slug, lang);
  const [isHovered, setIsHovered] = useState(false);
  const hasPreview = project.preview || (project.previews && project.previews.length > 0);

  return (
    <Link
      href={`/work/${project.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative block rounded-lg border border-line p-5 transition-colors duration-150 hover:border-text-2 hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
    >
      {hasPreview && (
        <div className="mb-4 aspect-[8/5] w-full rounded-md border border-line overflow-hidden [@media(hover:hover)]:hidden">
          <ProjectPreview
            preview={project.preview}
            previews={project.previews}
            alt={`Preview of ${project.title}`}
            isHovered={isHovered}
          />
        </div>
      )}

      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight">
          {project.title}
          <span className="ml-2 inline-block text-text-2 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent">
            →
          </span>
        </h3>
        <span className="shrink-0 font-mono text-xs text-text-2">
          {project.year} · {project.status}
        </span>
      </div>

      <p className="mt-1 text-sm text-text-2">{project.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-text-2">{project.summary}</p>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded border border-line px-2 py-0.5 font-mono text-xs text-text-2"
          >
            {tech}
          </li>
        ))}
      </ul>

      {hasPreview && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/4 z-40 hidden w-80 max-w-[85%] -translate-x-1/2 -translate-y-1/2 scale-95 overflow-hidden rounded-lg border border-line bg-surface opacity-0 shadow-2xl shadow-black/80 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 [@media(hover:hover)]:block"
        >
          <ProjectPreview
            preview={project.preview}
            previews={project.previews}
            alt={`Preview of ${project.title}`}
            className="aspect-[8/5] w-full"
            isHovered={isHovered}
          />
        </div>
      )}
    </Link>
  );
}
