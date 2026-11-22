"use client";

import { useState, ViewTransition, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProjects, type Project } from "@/lib/projects";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTranslation } from "@/hooks/useTranslation";

function still(p: Project) {
  return p.previews?.[0] ?? (Array.isArray(p.preview) ? p.preview[0] : p.preview) ?? null;
}

// Papers rest low inside the folder and rise out of it on hover, keyboard focus, or while the folder opens.
// Below md there is no hover, so they stay raised.
const rise =
  "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

/** One project as a folder: its screenshot and real repo files tucked inside, the story on the front. */
function Folder({ project }: { project: Project }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const src = still(project);
  const files = project.files ?? [];
  const href = `/work/${project.slug}`;

  // Open the folder first (papers rise, the flap falls), then navigate; the folder then grows into the
  // case study through the shared view-transition names. Reduced motion or no View Transitions: plain link.
  function open(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("startViewTransition" in document)) return;
    e.preventDefault();
    setOpening(true);
    window.setTimeout(() => router.push(href), 260);
  }

  return (
    <article className={`group relative ${opening ? "is-open" : ""}`} aria-labelledby={`folder-${project.slug}`}>
      <ViewTransition name={`folder-${project.slug}`}>
      {/* back of the folder, with its tab */}
      <div className="relative h-[23rem] sm:h-[24rem]">
        <div aria-hidden className="absolute left-0 top-0 h-8 w-[42%] rounded-t-xl border border-b-0 border-line bg-surface-2 transition-colors duration-300 group-hover:border-accent/60 group-focus-within:border-accent/60" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 top-7 rounded-xl rounded-tl-none border border-line bg-surface-2" />

        {/* papers inside */}
        <div aria-hidden className="absolute inset-x-4 top-12 bottom-0 overflow-hidden">
          {src && (
            <div
              className={`absolute left-0 top-0 w-[72%] ${rise} translate-y-[-6%] -rotate-2 md:translate-y-[18%] md:rotate-0 md:group-hover:translate-y-[-6%] md:group-hover:-rotate-2 md:group-focus-within:translate-y-[-6%] md:group-focus-within:-rotate-2 md:group-[.is-open]:translate-y-[-6%] md:group-[.is-open]:-rotate-2`}
            >
              <ViewTransition name={`still-${project.slug}`}>
                <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-lg shadow-black/30">
                  <img src={src} alt="" width={640} height={400} loading="lazy" className="aspect-[8/5] w-full object-cover object-top" />
                </div>
              </ViewTransition>
            </div>
          )}
          {files.map((file, i) => (
            <div
              key={file.name}
              style={{ ["--d" as string]: `${80 + i * 70}ms`, top: `${i * 2.6}rem` }}
              className={`absolute right-0 w-[48%] rounded-lg border border-line bg-bg px-3 py-2 shadow-md shadow-black/30 [transition-delay:var(--d)] ${rise} translate-x-0 rotate-[3deg] md:translate-x-[8%] md:translate-y-[30%] md:rotate-0 md:group-hover:translate-x-0 md:group-hover:translate-y-0 md:group-hover:rotate-[3deg] md:group-focus-within:translate-x-0 md:group-focus-within:translate-y-0 md:group-focus-within:rotate-[3deg] md:group-[.is-open]:translate-x-0 md:group-[.is-open]:translate-y-0 md:group-[.is-open]:rotate-[3deg]`}
            >
              <p className="truncate font-mono text-xs text-text">{file.name}</p>
              <p className="font-mono text-[11px] text-text-2">
                {file.kind} · {file.size}
              </p>
            </div>
          ))}
        </div>

        {/* front of the folder: the story */}
        <div className="absolute inset-x-0 bottom-0 flex min-h-[52%] origin-bottom flex-col rounded-xl border border-line bg-surface p-5 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:[transform:perspective(900px)_rotateX(-7deg)] md:group-focus-within:[transform:perspective(900px)_rotateX(-7deg)] md:group-[.is-open]:[transform:perspective(900px)_rotateX(-24deg)] motion-reduce:transition-none">
          <div className="flex items-baseline justify-between gap-3">
            <h3 id={`folder-${project.slug}`} className="text-xl font-semibold tracking-tight text-text">
              {project.title}
            </h3>
            <span className="shrink-0 font-mono text-xs text-text-2">{project.year}</span>
          </div>
          <p className="mt-1 text-sm text-text [text-wrap:pretty]">{project.tagline}</p>
          <p className="mt-2 line-clamp-2 text-sm text-text-2">{project.role} · {project.status}</p>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
            <Link
              href={href}
              onClick={open}
              className="inline-flex min-h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-bg transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("folderOpen")}
            </Link>
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-sm text-text transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
              >
                {t("folderLive")} ↗
              </a>
            )}
            <span className="ml-auto hidden font-mono text-xs text-text-2 sm:block">
              {project.stack.slice(0, 3).join(" · ")}
            </span>
          </div>
        </div>
      </div>
      </ViewTransition>
    </article>
  );
}

export function ProjectFolders() {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const projects = getProjects(lang);

  return (
    <div className="mt-4">
      <p className="max-w-[60ch] text-base text-text-2">{t("sectionWork")}</p>
      <div className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-2">
        {projects.map((p) => (
          <Folder key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}
