"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/profile";
import { useLanguage } from "@/components/providers/LanguageProvider";

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

export function Sidebar({
  portraitSrc,
  onHide,
}: {
  portraitSrc: string | null;
  onHide: () => void;
}) {
  const { lang } = useLanguage();
  const profile = getProfile(lang);

  return (
    <div className="flex h-full flex-col gap-8 p-8">
      <button
        type="button"
        onClick={onHide}
        className="-mb-4 ml-auto flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-text-2 transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16M15 10l-2 2 2 2" />
        </svg>
        {lang === "id" ? "Sembunyikan" : "Hide sidebar"}
      </button>
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
        <p className="text-xl font-semibold tracking-tight">{profile.name}</p>
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
