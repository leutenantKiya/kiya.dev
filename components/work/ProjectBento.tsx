import Link from "next/link";
import { projects, type Project } from "@/lib/projects";

function Thumb({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  if (!project.preview) return null;
  return (
    <img
      src={project.preview}
      alt={`Preview of ${project.title}`}
      loading="lazy"
      className={`w-full rounded-md border border-line object-cover object-top transition duration-200 group-hover:brightness-110 ${className ?? ""}`}
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

export function ProjectBento() {
  const [feature, ...rest] = projects; // Arbor = flagship feature tile
  const banner = rest[rest.length - 1]; // AILY = wide banner tile
  const mid = rest.slice(0, -1); // Lazy Builder, Nutrify = compact tiles

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
      {/* Feature tile — 2×2, keeps the full 10-second summary */}
      <Link
        href={`/work/${feature.slug}`}
        className={`${tileBase} flex flex-col sm:col-span-2 lg:col-span-2 lg:row-span-2`}
      >
        <Thumb project={feature} className="aspect-[16/9]" />
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight">
            {feature.title}
            <span className="ml-2 inline-block text-text-2 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent">
              →
            </span>
          </h3>
          <span className="shrink-0 font-mono text-xs text-accent">
            {feature.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-text-2">{feature.tagline}</p>
        <p className="mt-3 text-sm leading-relaxed text-text-2">
          {feature.summary}
        </p>
        <StackPills stack={feature.stack} />
      </Link>

      {/* Compact tiles */}
      {mid.map((project) => (
        <Link
          key={project.slug}
          href={`/work/${project.slug}`}
          className={`${tileBase} flex flex-col`}
        >
          <Thumb project={project} className="aspect-[16/9]" />
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            {project.title}
            <span className="ml-2 inline-block text-text-2 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent">
              →
            </span>
          </h3>
          <p className="mt-1 text-sm text-text-2">{project.tagline}</p>
          <StackPills stack={project.stack} />
        </Link>
      ))}

      {/* Wide banner tile — horizontal on larger screens */}
      <Link
        href={`/work/${banner.slug}`}
        className={`${tileBase} flex flex-col gap-4 sm:col-span-2 sm:flex-row lg:col-span-3`}
      >
        <Thumb
          project={banner}
          className="sm:h-full sm:w-56 sm:shrink-0 aspect-[16/9] sm:aspect-auto"
        />
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-base font-semibold tracking-tight">
              {banner.title}
              <span className="ml-2 inline-block text-text-2 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent">
                →
              </span>
            </h3>
            <span className="shrink-0 font-mono text-xs text-text-2">
              {banner.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-2">{banner.tagline}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-2">
            {banner.summary}
          </p>
          <StackPills stack={banner.stack} />
        </div>
      </Link>
    </div>
  );
}
