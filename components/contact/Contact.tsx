"use client";

import { useState } from "react";
import { profile } from "@/lib/profile";
import { about } from "@/lib/about";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTranslation } from "@/hooks/useTranslation";
import FeedbackJar from "./FeedbackJar";
import { ContactSnowman } from "@/components/seasonal/Seasonal3D";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const contactLine = about.contactLine[lang] ?? about.contactLine.en;

  async function copyEmail() {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <p className="max-w-[48ch] text-xl font-semibold leading-snug tracking-tight text-text [text-wrap:balance]">{t("contactLooking")}</p>
          <p className="mt-3 text-base leading-relaxed text-text-2">{contactLine}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-bg transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
        <ContactSnowman />
      </div>

      <div className="pt-4">
        <FeedbackJar />
      </div>
    </div>
  );
}
