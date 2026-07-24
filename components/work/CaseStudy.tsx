import type { ReactNode } from "react";
import Link from "next/link";
import { getProject } from "@/lib/projects";

export function CaseStudy({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const project = getProject(slug);

  return (
    <div className="mx-auto max-w-[720px] px-5 py-12 lg:px-12">
      <Link
        href="/#work"
        className="font-mono text-xs text-text-2 transition-colors duration-150 hover:text-accent"
      >
        ← back to work
      </Link>

      <header className="mt-8 border-b border-line pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-2 text-lg text-text-2">{project.tagline}</p>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs sm:grid-cols-4">
          <div>
            <dt className="uppercase tracking-widest text-text-2">Year</dt>
            <dd className="mt-1">{project.year}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-widest text-text-2">Status</dt>
            <dd className="mt-1 text-accent">{project.status}</dd>
          </div>
          <div className="col-span-2">
            <dt className="uppercase tracking-widest text-text-2">Context</dt>
            <dd className="mt-1">{project.role}</dd>
          </div>
        </dl>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Stack">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded border border-line px-2 py-0.5 font-mono text-xs text-text-2"
            >
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-3 font-mono text-xs">
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-line px-3 py-2.5 sm:py-1.5 transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            Repository ↗
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-accent px-3 py-2.5 sm:py-1.5 text-accent transition-colors duration-150 hover:bg-accent hover:text-bg"
            >
              Live demo ↗
            </a>
          )}
        </div>
      </header>

      <article className="prose prose-invert mt-8 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-xl prose-p:text-text-2 prose-li:text-text-2 prose-strong:text-text prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-surface prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-line prose-pre:bg-surface prose-pre:text-[13px] prose-hr:border-line prose-table:text-sm prose-th:font-mono prose-th:text-xs prose-th:uppercase prose-th:tracking-widest prose-th:text-text-2 prose-td:text-text-2">
        {children}
      </article>

      <footer className="mt-12 border-t border-line pt-6">
        <Link
          href="/#work"
          className="font-mono text-xs text-text-2 transition-colors duration-150 hover:text-accent"
        >
          ← back to work
        </Link>
      </footer>
    </div>
  );
}
