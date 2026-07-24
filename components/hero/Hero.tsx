"use client";

import { useEffect, useRef, useState } from "react";
import { profile, sections } from "@/lib/profile";
import { LangToggle } from "@/components/ui/LangToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { animate } from "animejs";

export function Hero({ portraitSrc }: { portraitSrc: string | null }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (headingRef.current) {
      animate(headingRef.current, {
        x: [-1080, 0],
        opacity: [0, 1],
        duration: 1200,
        ease: "outExpo",
      });
    }
    if (imageRef.current) {
      animate(imageRef.current, {
        y: [200, -35],
        opacity: [0, 1],
        duration: 1200,
        ease: "outExpo",
      });
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative flex h-dvh min-h-[720px] w-full flex-col justify-between border-b border-line bg-bg overflow-hidden select-none"
    >
      {/* Desktop navbar */}
      <nav
        aria-label="Primary"
        className="hidden items-center justify-between px-12 py-5 lg:flex relative z-30"
      >
        <span className="font-mono text-sm font-semibold tracking-tight text-text">
          kiya<span className="text-accent">.dev</span>
        </span>
        <div className="flex items-center gap-4">
          <ul className="flex items-center gap-4">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="rounded px-1.5 py-1 text-sm text-text-2 transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          <LangToggle />
        </div>
      </nav>

      {/* Main hero stage — heading, subtitle, and (mobile) bio, all ABOVE the figure */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-start pt-4 px-5 text-center">
        {/* ENORMOUS "Hi, I'm Kiya" Header animated with animejs */}
        <h1
          ref={headingRef}
          className="relative z-10 text-5xl sm:text-8xl md:text-9xl lg:text-[11rem] font-extrabold tracking-tighter text-text leading-none"
        >
          Hi, I&apos;m {profile.name}
        </h1>

        <p className="relative z-30 mt-4 font-mono text-sm sm:text-base lg:text-lg uppercase tracking-[0.25em] text-accent font-semibold">
          {profile.title}
        </p>

        {/* Mobile bio — sits under the subtitle in the open top area, clear of the figure */}
        <p className="relative z-30 mt-5 max-w-[440px] text-sm leading-relaxed text-text-2 lg:hidden">
          {profile.bio}
        </p>
      </div>

      {/* Portrait — fills the frame (transparent bg), grounded at the bottom */}
      {portraitSrc ? (
        <div
          ref={imageRef}
          className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 pointer-events-none flex items-end justify-center"
        >
          <img
            src={portraitSrc}
            alt={`Portrait of ${profile.name}`}
            className="h-[42vh] sm:h-[52vh] md:h-[56vh] lg:h-[60vh] max-h-[680px] w-auto max-w-[90vw] object-contain object-bottom drop-shadow-2xl"
          />
        </div>
      ) : (
        <div className="absolute bottom-16 left-1/2 z-20 -translate-x-1/2 flex h-64 w-64 items-center justify-center gap-2 text-text-2">
          <span className="text-4xl">☺</span>
          <span className="font-mono text-xs">add /public/me.png</span>
        </div>
      )}

      {/* Bottom scrim — grounds the figure and keeps corner text readable */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-bg to-transparent"
      />

      {/* Desktop bio — lower-left corner, never crosses the face (mobile uses the top copy) */}
      <p className="absolute bottom-8 left-12 z-30 hidden max-w-xs text-left text-sm leading-relaxed text-text-2 lg:block">
        {profile.bio}
      </p>

      {/* Scroll cue */}
      <a
        href="#work"
        aria-label="Scroll to work"
        className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 font-mono text-xs text-text-2 transition-colors duration-150 hover:text-accent motion-safe:animate-bounce"
      >
        ↓
      </a>
    </section>
  );
}
