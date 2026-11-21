"use client";

import Link from "next/link";
import { getProfile } from "@/lib/profile";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTranslation } from "@/hooks/useTranslation";

/** The close: your name large, one action, and the two link groups that actually exist. */
export function Footer() {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const profile = getProfile(lang);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1040px] gap-10 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-12">
        <div>
          <p className="text-5xl font-semibold tracking-tight text-text sm:text-6xl">
            kiya<span className="text-accent">.dev</span>
          </p>
          <p className="mt-3 max-w-[34ch] text-base text-text-2">{t("footerLine")}</p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-bg transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("ctaEmail")}
          </a>
        </div>

        <nav aria-label={t("footerExplore")}>
          <p className="font-mono text-xs text-text-2">{t("footerExplore")}</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {profile.sections.map((s) => (
              <li key={s.id}>
                <Link href={`/#${s.id}`} className="text-text transition-colors duration-150 hover:text-accent">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="font-mono text-xs text-text-2">{t("footerConnect")}</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {profile.socials.map((s) => (
              <li key={s.platform}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-text transition-colors duration-150 hover:text-accent">
                  {s.platform} ↗
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${profile.email}`} className="text-text transition-colors duration-150 hover:text-accent">
                {profile.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-[1040px] px-5 pb-8 font-mono text-xs text-text-2 lg:px-12">
        © {new Date().getFullYear()} Antonius Kiya Ananda Derron
      </p>
    </footer>
  );
}
