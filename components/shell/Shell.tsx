"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LangToggle } from "@/components/ui/LangToggle";
import { getSections } from "@/lib/profile";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { SantaHat } from "@/components/seasonal/Garland";
import { MusicToggle, SeasonToggle } from "@/components/seasonal/SeasonToggles";
import { Footer } from "@/components/shell/Footer";

export function Shell({
  portraitSrc,
  children,
}: {
  portraitSrc: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const sections = getSections(lang);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);


  return (
    <>

      {/* One floating pill navbar, sticky on every page and width. */}
      <header
        className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 lg:top-4"
      >
        <div
          className={`pointer-events-auto flex w-full max-w-[1040px] items-center justify-between gap-3 rounded-full border border-line py-1.5 pl-2 pr-1.5 backdrop-blur-md transition-[background-color,box-shadow] duration-300 ${
            scrolled || menuOpen ? "bg-bg/90 shadow-lg shadow-black/25" : "bg-bg/60"
          }`}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-full pr-1 font-mono text-sm font-semibold tracking-tight text-text"
          >
            {portraitSrc && (
              <img
                src={portraitSrc}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full border border-line object-cover object-top"
              />
            )}
            <span className="relative">
              <SantaHat />
              kiya<span className="text-accent">.dev</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`/#${section.id}`}
                    className="rounded-full px-3 py-1.5 text-sm text-text-2 transition-colors duration-150 hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <MusicToggle />
            <div className="hidden items-center gap-1.5 sm:flex">
              <ThemeToggle compact />
              <LangToggle />
            </div>
            <div className="hidden lg:block">
              <SeasonToggle />
            </div>

            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-text transition-colors duration-150 hover:border-accent hover:text-accent lg:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path
                  className="origin-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: menuOpen ? "translateY(5px) rotate(45deg)" : "none" }}
                  d="M4 7h16"
                />
                <path
                  className="transition-opacity duration-200"
                  style={{ opacity: menuOpen ? 0 : 1 }}
                  d="M4 12h16"
                />
                <path
                  className="origin-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: menuOpen ? "translateY(-5px) rotate(-45deg)" : "none" }}
                  d="M4 17h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-x-3 top-[72px] z-40 max-h-[calc(100dvh-84px)] overflow-y-auto rounded-3xl border border-line bg-bg/95 px-5 py-5 shadow-2xl backdrop-blur-md lg:hidden">
          <nav aria-label="Mobile Navigation">
            <p className="font-mono text-xs text-text-2 mb-2">
              {lang === "id" ? "Navigasi" : "Navigation"}
            </p>
            <ul className="flex flex-col gap-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`/#${section.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded px-3 py-2.5 text-sm text-text-2 transition-colors duration-150 hover:bg-surface hover:text-text"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <SeasonToggle showLabel />
              <span className="sm:hidden">
                <ThemeToggle compact />
              </span>
              <span className="sm:hidden">
                <LangToggle />
              </span>
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <p className="font-mono text-xs text-text-2 mb-2">
                {lang === "id" ? "Studi Kasus" : "Case Studies"}
              </p>
              <ul className="flex flex-col gap-1 text-sm text-text-2">
                <li>
                  <Link
                    href="/work/genesis-town"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded px-3 py-2 hover:bg-surface hover:text-text"
                  >
                    Genesis Town — On-chain market town
                  </Link>
                </li>
                <li>
                  <Link
                    href="/work/lazy-builder"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded px-3 py-2 hover:bg-surface hover:text-text"
                  >
                    Lazy Builder — Canvas + Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/work/nutrify"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded px-3 py-2 hover:bg-surface hover:text-text"
                  >
                    Nutrify — AI Food Recognition
                  </Link>
                </li>
                <li>
                  <Link
                    href="/work/aily"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded px-3 py-2 hover:bg-surface hover:text-text"
                  >
                    AILY — E-commerce Chatbot
                  </Link>
                </li>
                <li>
                  <Link
                    href="/work/justpush"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded px-3 py-2 hover:bg-surface hover:text-text"
                  >
                    JustPush — API routes to Kong
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      )}

      <main className={pathname === "/" ? "" : "pt-24"}>
        {children}
      </main>
      <Footer />

    </>
  );
}
