"use client";

import { useEffect, useRef, useState } from "react";
import { getProfile } from "@/lib/profile";
import { animate } from "animejs";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { KineticText } from "../ui/kinetic-text";
import { Garland } from "@/components/seasonal/Garland";
import { HeroTree } from "@/components/seasonal/Seasonal3D";

export function Hero({ portraitSrc }: { portraitSrc: string | null }) {
  const { lang } = useLanguage();
  const profile = getProfile(lang);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef(null);

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
      <Garland />

      {/* Heading, subtitle, and (mobile) bio — kept above the figure so nothing overlaps the face */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-start px-5 pt-32 text-center lg:pt-28">
        {/* Big "Hi, I'm Kiya" heading, slides in via anime.js */}
        <KineticText
          key={lang}
          ref={headingRef}
          className="relative z-10 text-5xl sm:text-8xl md:text-9xl lg:text-[11rem] font-extrabold tracking-tighter text-text leading-none"
          text={lang === "id" ? `Halo, Saya ${profile.name}` : `Hi, I'm ${profile.name}`}
        />

        <p className="relative z-30 mt-4 font-mono text-sm sm:text-base lg:text-lg uppercase tracking-[0.25em] text-accent font-semibold">
          {profile.title}
        </p>

        {/* Mobile bio */}
        <p className="relative z-30 mt-5 max-w-[440px] text-base leading-relaxed text-text [text-wrap:pretty] lg:hidden">
          {profile.bio}
        </p>
      </div>

      <HeroTree />

      {/* Portrait */}
      {portraitSrc ? (
        <div
          ref={imageRef}
          className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 pointer-events-none flex items-end justify-center"
        >
          <img
            src={portraitSrc}
            alt={`Portrait of ${profile.name}`}
            className="h-[48vh] sm:h-[52vh] md:h-[56vh] lg:h-[60vh] max-h-[680px] w-auto max-w-[90vw] object-contain object-bottom drop-shadow-2xl"
          />
        </div>
      ) : (
        <div className="absolute bottom-16 left-1/2 z-20 -translate-x-1/2 flex h-64 w-64 items-center justify-center gap-2 text-text-2">
          <span className="text-4xl">☺</span>
          <span className="font-mono text-xs">add /public/me.png</span>
        </div>
      )}

      {/* Bottom scrim */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-bg to-transparent"
      />

      {/* Desktop bio */}
      <p className="absolute bottom-12 left-12 z-30 hidden max-w-sm text-left text-base leading-relaxed text-text [text-wrap:pretty] lg:block">
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
