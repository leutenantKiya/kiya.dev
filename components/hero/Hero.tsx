"use client";

import { useEffect, useRef, useState } from "react";
import { getProfile, profile } from "@/lib/profile";
import { useTranslation } from "@/hooks/useTranslation";
import { animate } from "animejs";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Garland } from "@/components/seasonal/Garland";
import { HeroScene } from "./HeroScene";

function HeroIntro({ align = "center" }: { align?: "center" | "left" }) {
  const { t } = useTranslation();
  const center = align === "center";
  return (
    <>
      <p className={`text-base leading-relaxed text-text [text-wrap:pretty] ${center ? "text-center" : ""}`}>{t("heroIntro")}</p>
      <p className={`mt-3 text-sm leading-relaxed text-text-2 [text-wrap:pretty] ${center ? "text-center" : ""}`}>{t("heroProof")}</p>
      <div className={`mt-5 ${center ? "grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center" : "flex flex-wrap items-center gap-2"}`}>
        <a
          href="#work"
          className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-bg transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("ctaProjects")}
        </a>
        <a
          href="#experience"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 text-sm text-text transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
        >
          {t("ctaExperience")}
        </a>
        <a
          href={`mailto:${profile.email}`}
          className={`inline-flex min-h-11 items-center justify-center text-sm transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent ${
            center ? "rounded-full border border-line px-4 text-text sm:border-0 sm:px-3 sm:text-text-2 sm:underline-offset-4 sm:hover:underline" : "px-3 text-text-2 underline-offset-4 hover:underline"
          }`}
        >
          {t("ctaEmail")}
        </a>
      </div>
    </>
  );
}

export function Hero({ portraitSrc }: { portraitSrc: string | null }) {
  const { lang } = useLanguage();
  const profile = getProfile(lang);

  const heroRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef(null);
  const greeting = lang === "id" ? "Halo, saya" : "Hi, I'm";
  const half = Math.ceil(profile.name.length / 2);
  const halves = [profile.name.slice(0, half), profile.name.slice(half)];

  // As the hero scrolls away, the two halves of the name drift apart and the portrait rises.
  // One CSS variable (--hp, 0 to 1) drives it; reduced motion leaves it at 0.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight * 0.8)));
      el.style.setProperty("--hp", p.toFixed(3));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (nameRef.current) {
      animate(nameRef.current, {
        y: [120, 0],
        opacity: [0, 1],
        duration: 1100,
        ease: "outQuint",
      });
    }
    if (imageRef.current) {
      animate(imageRef.current, {
        y: [200, -35],
        opacity: [0, 1],
        duration: 1100,
        delay: 80,
        ease: "outQuint",
      });
    }
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-layers relative flex h-dvh min-h-[1000px] sm:min-h-[720px] w-full flex-col justify-between border-b border-line bg-bg overflow-hidden select-none"
    >
      <HeroScene />
      <Garland />

      {/* Greeting and intro sit in front of everything; the name itself stands behind the portrait */}
      <div className="relative z-30 flex flex-1 flex-col items-center justify-start px-5 pt-28 text-center lg:pt-24">
        {/* Phones: greeting and name together in the flow. From sm the visible pair moves to the layered
            name below, and this heading stays for screen readers only. */}
        <h1 className="flex flex-col items-center sm:sr-only">
          <span className="text-3xl font-semibold tracking-tight text-text">{greeting}</span>
          <span className="mt-1 text-[22vw] font-extrabold uppercase leading-[0.8] tracking-[-0.04em] text-text">
            {profile.name}
          </span>
        </h1>

        <p className="relative z-30 mt-4 font-mono text-sm sm:text-base lg:text-lg uppercase tracking-[0.25em] text-accent font-semibold">
          {profile.title}
        </p>

        {/* Mobile intro */}
        <div className="relative z-30 mt-5 max-w-[460px] rounded-2xl bg-bg/70 px-3 py-3 backdrop-blur-sm lg:hidden">
          <HeroIntro />
        </div>
      </div>

      {/* The name, split around the portrait's head so every letter shows, between the back layer
          (scenery, garland) and the front layer (portrait) */}
      <div ref={nameRef} aria-hidden className="hero-name pointer-events-none absolute z-[15] hidden sm:block">
        <span className="hero-greeting absolute bottom-full left-1/2 mb-[0.35em] -translate-x-1/2 whitespace-nowrap text-5xl font-semibold tracking-tight text-text">
          {greeting}
        </span>
        <span className="hero-name-row text-text">
          <span className="hero-half hero-half-left">{halves[0]}</span>
          <span className="hero-half hero-half-right">{halves[1]}</span>
        </span>
        {/* On the ice: a blurred, fading mirror of the name, holiday mode only */}
        <span className="hero-name-row hero-name-reflect absolute left-0 top-full text-text">
          <span className="hero-half hero-half-left">{halves[0]}</span>
          <span className="hero-half hero-half-right">{halves[1]}</span>
        </span>
      </div>

      {/* Portrait */}
      {portraitSrc ? (
        <div
          ref={imageRef}
          className="absolute bottom-0 left-2/5 z-20 -translate-x-1/2 pointer-events-none flex items-end justify-center sm:left-1/2"
        >
          <img
            src={portraitSrc}
            alt={`Portrait of ${profile.name}`}
            className="hero-portrait h-[38vh] sm:h-[52vh] md:h-[56vh] lg:h-[60vh] max-h-[680px] w-auto max-w-[90vw] object-contain object-bottom drop-shadow-2xl"
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
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-48 bg-gradient-to-t from-bg via-bg/60 to-transparent"
      />

      {/* Desktop intro */}
      <div className="absolute bottom-12 left-12 z-30 hidden max-w-md rounded-2xl bg-bg/75 p-5 text-left backdrop-blur-sm lg:block">
        <HeroIntro align="left" />
      </div>

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
