"use client";

import { ViewTransition, type ReactNode } from "react";
import Link from "next/link";
import { getProject } from "@/lib/projects";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { dictionary } from "@/lib/dictionary";
import { CaseStudyTree } from "@/components/seasonal/Seasonal3D";

export function En({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();
  if (lang !== "en") return null;
  return <>{children}</>;
}

export function Id({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();
  if (lang !== "id") return null;
  return <>{children}</>;
}

export function CaseStudy({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const { lang } = useLanguage();
  const project = getProject(slug, lang);
  const t = dictionary[lang];
  const still = project.previews?.[0] ?? (Array.isArray(project.preview) ? project.preview[0] : project.preview);
  // YouTube embeds in the page; anything else (an X post, say) is a link next to the repo.
  const youtube = project.video && /youtube\.com|youtu\.be/.test(project.video) ? project.video : null;
  const videoLink = project.video && !youtube ? project.video : null;

  return (
    // Same view-transition names as the project's folder on the home page: the folder grows into this page,
    // and its screenshot lands as the image below the header. Back navigation plays it in reverse.
    <>
    <ViewTransition name={`folder-${slug}`}>
    <div className="mx-auto max-w-[720px] px-5 py-12 lg:px-12">
      <Link
        href="/#work"
        className="font-mono text-xs text-text-2 transition-colors duration-150 hover:text-accent"
      >
        {t.backToWork}
      </Link>

      <header className="mt-8 border-b border-line pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-2 text-lg text-text-2">{project.tagline}</p>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs sm:grid-cols-4">
          <div>
            <dt className="text-text-2">{t.year}</dt>
            <dd className="mt-1">{project.year}</dd>
          </div>
          <div>
            <dt className="text-text-2">{t.status}</dt>
            <dd className="mt-1 text-accent">{project.status}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-text-2">{t.context}</dt>
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
            {t.repo}
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-accent px-3 py-2.5 sm:py-1.5 text-accent transition-colors duration-150 hover:bg-accent hover:text-bg"
            >
              {t.demo}
            </a>
          )}
          {videoLink && (
            <a
              href={videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-accent px-3 py-2.5 sm:py-1.5 text-accent transition-colors duration-150 hover:bg-accent hover:text-bg"
            >
              {t.watchDemo}
            </a>
          )}
        </div>
      </header>

      {still && (
        <ViewTransition name={`still-${slug}`}>
          <figure className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
            <img src={still} alt={`${project.title}: ${project.tagline}`} width={1280} height={800} className="aspect-[8/5] w-full object-cover object-top" />
          </figure>
        </ViewTransition>
      )}

      {youtube && (
        <div className="my-6 overflow-hidden rounded-xl border border-line shadow-2xl">
          <iframe
            className="aspect-video w-full"
            src={
              youtube.includes("embed/")
                ? youtube
                : youtube.includes("youtu.be/")
                ? youtube.replace("youtu.be/", "www.youtube-nocookie.com/embed/").split("?")[0]
                : youtube.replace("watch?v=", "embed/")
            }
            title={`${project.title} preview`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}

      <article className="prose dark:prose-invert mt-8 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-text prose-h2:mt-10 prose-h2:text-xl prose-h2:border-b prose-h2:border-line prose-h2:pb-2 prose-p:text-text-2 prose-li:text-text-2 prose-strong:text-text prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-surface prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-[13px] prose-code:text-text prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-line prose-pre:bg-surface prose-pre:text-[13px] prose-pre:text-text prose-hr:border-line prose-table:text-sm prose-th:font-mono prose-th:text-xs prose-th:uppercase prose-th:tracking-widest prose-th:text-text-2 prose-td:text-text-2">
        {children}
      </article>

      <footer className="mt-12 border-t border-line pt-6">
        <Link
          href="/#work"
          className="font-mono text-xs text-text-2 transition-colors duration-150 hover:text-accent"
        >
          {t.backToWork}
        </Link>
      </footer>
    </div>
    </ViewTransition>
    {/* outside the folder's view transition, so the tree doesn't morph with the page */}
    <CaseStudyTree />
    </>
  );
}
