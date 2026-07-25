"use client";

import { useEffect, useState } from "react";
import { getProfile, getSections } from "@/lib/profile";
import { LangToggle } from "@/components/ui/LangToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";

function useActiveSection(): string | null {
  const { lang } = useLanguage();
  const sections = getSections(lang);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return active;
}

function CopyEmail() {
  const { lang } = useLanguage();
  const profile = getProfile(lang);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="font-mono text-xs text-text-2 transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      aria-label={`Copy email address ${profile.email}`}
    >
      {copied ? (lang === "id" ? "tersalin ✓" : "copied ✓") : profile.email}
    </button>
  );
}

export function Sidebar({ portraitSrc }: { portraitSrc: string | null }) {
  const { lang } = useLanguage();
  const profile = getProfile(lang);
  const sections = getSections(lang);
  const active = useActiveSection();

  return (
    <div className="flex h-full flex-col gap-8 p-8">
      <div className="flex flex-wrap items-center gap-2">
        <ThemeToggle />
        <LangToggle />
      </div>

      <header>
        {portraitSrc && (
          <img
            src={portraitSrc}
            alt={`Portrait of ${profile.name}`}
            width={112}
            height={112}
            className="mb-5 h-28 w-28 rounded-md border border-line object-cover object-top grayscale-[35%] transition-[filter] duration-300 hover:grayscale-0"
          />
        )}
        <h1 className="text-xl font-semibold tracking-tight">{profile.name}</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-accent">
          {profile.title}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-text-2">{profile.bio}</p>
      </header>

      <ul className="flex flex-wrap gap-1.5" aria-label="Core technologies">
        {profile.pills.map((pill) => (
          <li
            key={pill}
            className="rounded border border-line px-2 py-0.5 font-mono text-xs text-text-2"
          >
            {pill}
          </li>
        ))}
      </ul>

      <nav aria-label="Sections">
        <ul className="flex flex-col gap-1">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`/#${section.id}`}
                aria-current={active === section.id ? "true" : undefined}
                className={`block rounded border-l-2 px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-accent ${
                  active === section.id
                    ? "border-accent text-text"
                    : "border-transparent text-text-2"
                }`}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        {profile.resume && (
          <a
            href={profile.resume}
            download
            className="inline-flex w-fit items-center gap-2 rounded-md border border-line px-3 py-1.5 font-mono text-xs text-text transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            {lang === "id" ? "Resume ↓" : "Resume ↓"}
          </a>
        )}

        <div className="flex flex-col gap-2" aria-label="Contact links">
          {profile.socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-text-2 transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              {social.platform} ↗
            </a>
          ))}
          <CopyEmail />
        </div>
      </div>
    </div>
  );
}
