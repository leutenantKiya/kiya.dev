"use client";

import { useState } from "react";
import { profile } from "@/lib/profile";
import { about } from "@/lib/about";
import { useLanguage } from "@/components/providers/LanguageProvider";
import FeedbackJar from "./FeedbackJar";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();
  const contactLine = about.contactLine[lang] ?? about.contactLine.en;

  async function copyEmail() {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div>
        <p className="text-sm leading-relaxed text-text-2">{contactLine}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="rounded-md border border-accent px-4 py-2 font-mono text-xs text-accent transition-colors duration-150 hover:bg-accent hover:text-bg focus-visible:outline-2 focus-visible:outline-accent"
          >
            {profile.email}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="rounded-md border border-line px-3 py-2.5 font-mono text-xs text-text-2 transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            {copied ? (lang === "id" ? "tersalin ✓" : "copied ✓") : "copy"}
          </button>

          {profile.socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-line px-3 py-2.5 font-mono text-xs text-text-2 transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              {social.platform} ↗
            </a>
          ))}

          {profile.resume && (
            <a
              href={profile.resume}
              download
              className="rounded-md border border-line px-3 py-2.5 font-mono text-xs text-text-2 transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              Resume ↓
            </a>
          )}
        </div>
      </div>

      <div className="pt-4">
        <FeedbackJar />
      </div>
    </div>
  );
}
