"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { CursorJet } from "@/components/ui/CursorJet";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LangToggle } from "@/components/ui/LangToggle";
import { getSections } from "@/lib/profile";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { SantaHat } from "@/components/seasonal/Garland";
import { MusicToggle, SeasonToggle } from "@/components/seasonal/SeasonToggles";

export function Shell({
  portraitSrc,
  jetSrc,
  children,
}: {
  portraitSrc: string | null;
  jetSrc: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const sections = getSections(lang);
  const [sidebarShown, setSidebarShown] = useState(pathname !== "/");
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

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      setSidebarShown(true);
      return;
    }
    const update = () => {
      const bottom = hero.getBoundingClientRect().bottom;
      setSidebarShown(bottom < window.innerHeight * 0.5);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <>
      <aside
        aria-hidden={!sidebarShown}
        className={`fixed left-0 top-0 z-40 hidden h-dvh w-[340px] overflow-y-auto border-r border-line bg-bg transition-transform duration-300 ease-out lg:block ${
          sidebarShown ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar portraitSrc={portraitSrc} />
      </aside>

      {/* One floating pill navbar, sticky on every page and width. */}
      <header
        className={`pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 transition-[padding] duration-300 ease-out lg:top-4 ${
          sidebarShown ? "lg:pl-[352px]" : ""
        }`}
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
            <p className="font-mono text-xs uppercase tracking-widest text-text-2 mb-2">
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
              <p className="font-mono text-xs uppercase tracking-widest text-text-2 mb-2">
                {lang === "id" ? "Studi Kasus" : "Case Studies"}
              </p>
              <ul className="flex flex-col gap-1 text-sm text-text-2">
                <li>
                  <Link
                    href="/work/arbor"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded px-3 py-2 hover:bg-surface hover:text-text"
                  >
                    Arbor — Pay-per-second streaming
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
              </ul>
            </div>
          </nav>
        </div>
      )}

      <main
        className={`transition-[margin-left] duration-300 ease-out ${pathname === "/" ? "" : "pt-24"} ${
          sidebarShown ? "lg:ml-[340px]" : "lg:ml-0"
        }`}
      >
        {children}
      </main>

      {jetSrc && <CursorJet src={jetSrc} />}
    </>
  );
}
