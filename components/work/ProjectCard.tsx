import Link from "next/link";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group relative block rounded-lg border border-line p-5 transition-colors duration-150 hover:border-text-2 hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
    >
      {/* Touch devices: inline thumbnail (no hover available) */}
      {project.preview && (
        <img
          src={project.preview}
          alt={`Preview of ${project.title}`}
          loading="lazy"
          className="mb-4 aspect-[8/5] w-full rounded-md border border-line object-cover object-top [@media(hover:hover)]:hidden"
        />
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

      {/* Pointer devices: centered preview popover that stays safely within card boundaries */}
      {project.preview && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/4 z-40 hidden w-80 max-w-[85%] -translate-x-1/2 -translate-y-1/2 scale-95 overflow-hidden rounded-lg border border-line bg-surface opacity-0 shadow-2xl shadow-black/80 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 [@media(hover:hover)]:block"
        >
          <img
            src={project.preview}
            alt=""
            loading="lazy"
            className="aspect-[8/5] w-full object-cover object-top"
          />
        </div>
      )}
    </Link>
  );
}
