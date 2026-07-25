"use client";

import { useState } from "react";
import Link from "next/link";
import { getProjects, type Project } from "@/lib/projects";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { ProjectPreview } from "./ProjectPreview";

function Thumb({
  project,
  className,
  isHovered,
}: {
  project: Project;
  className?: string;
  isHovered?: boolean;
}) {
  if (!project.preview && (!project.previews || project.previews.length === 0)) return null;
  return (
    <ProjectPreview
      preview={project.preview}
      previews={project.previews}
      alt={`Preview of ${project.title}`}
      className={`rounded-md border border-line ${className ?? ""}`}
      isHovered={isHovered}
    />
  );
}

function StackPills({ stack }: { stack: string[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Stack">
      {stack.map((tech) => (
        <li
          key={tech}
          className="rounded border border-line px-2 py-0.5 font-mono text-xs text-text-2"
        >
          {tech}
        </li>
      ))}
    </ul>
  );
}

const tileBase =
  "group block rounded-lg border border-line p-5 transition-colors duration-150 hover:border-text-2 hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent";

function FeatureTile({ project }: { project: Project }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      href={`/work/${project.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${tileBase} flex flex-col sm:col-span-2 lg:col-span-2 lg:row-span-2`}
    >
      <Thumb project={project} className="aspect-[16/9]" isHovered={isHovered} />
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight">
          {project.title}
          <span className="ml-2 inline-block text-text-2 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent">
            →
          </span>
        </h3>
        <span className="shrink-0 font-mono text-xs text-accent">
          {project.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-text-2">{project.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-text-2">
        {project.summary}
      </p>
      <StackPills stack={project.stack} />
    </Link>
  );
}

function CompactTile({ project }: { project: Project }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      key={project.slug}
      href={`/work/${project.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${tileBase} flex flex-col`}
    >
      <Thumb project={project} className="aspect-[16/9]" isHovered={isHovered} />
      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {project.title}
        <span className="ml-2 inline-block text-text-2 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent">
          →
        </span>
      </h3>
      <p className="mt-1 text-sm text-text-2">{project.tagline}</p>
      <StackPills stack={project.stack} />
    </Link>
  );
}

function BannerTile({ project }: { project: Project }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      href={`/work/${project.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${tileBase} flex flex-col gap-4 sm:col-span-2 sm:flex-row lg:col-span-3`}
    >
      <Thumb
        project={project}
        className="sm:h-full sm:w-56 sm:shrink-0 aspect-[16/9] sm:aspect-auto"
        isHovered={isHovered}
      />
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-base font-semibold tracking-tight">
            {project.title}
            <span className="ml-2 inline-block text-text-2 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent">
              →
            </span>
          </h3>
          <span className="shrink-0 font-mono text-xs text-text-2">
            {project.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-text-2">{project.tagline}</p>
        <p className="mt-2 text-sm leading-relaxed text-text-2">
          {project.summary}
        </p>
        <StackPills stack={project.stack} />
      </div>
    </Link>
  );
}

export function ProjectBento() {
  const { lang } = useLanguage();
  const allProjects = getProjects(lang);
  const [feature, ...rest] = allProjects;
  const banner = rest[rest.length - 1];
  const mid = rest.slice(0, -1);

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:row-span-2">
      <FeatureTile project={feature} />
      {mid.map((project) => (
        <CompactTile key={project.slug} project={project} />
      ))}
      <BannerTile project={banner} />
    </div>
  );
}
