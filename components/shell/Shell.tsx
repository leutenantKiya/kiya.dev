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

      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-bg/90 px-5 py-3.5 backdrop-blur lg:hidden">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight text-text"
        >
          {portraitSrc && (
            <img
              src={portraitSrc}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full border border-line object-cover object-top"
            />
          )}
          <span>
            kiya<span className="text-accent">.dev</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LangToggle />

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-text transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            <span className="text-base leading-none">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-x-0 top-[57px] z-40 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-line bg-bg/95 px-5 py-5 backdrop-blur shadow-2xl lg:hidden">
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
        className={`transition-[margin-left] duration-300 ease-out pt-14 lg:pt-0 ${
          sidebarShown ? "lg:ml-[340px]" : "lg:ml-0"
        }`}
      >
        {children}
      </main>

      {jetSrc && <CursorJet src={jetSrc} />}
    </>
  );
}
