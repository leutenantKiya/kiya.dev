"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { getSkills } from "@/lib/skills";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTranslation } from "@/hooks/useTranslation";

/** Four areas of work. Each tab names the tools and the projects that prove them. */
export function SkillTabs() {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const skills = getSkills(lang);
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const skill = skills[active];

  function onKey(e: KeyboardEvent) {
    const last = skills.length - 1;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="mt-4">
      <p className="max-w-[60ch] text-base text-text-2">{t("sectionSkills")}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-[15rem_1fr]">
        <div role="tablist" aria-orientation="vertical" aria-label={t("sectionSkills")} onKeyDown={onKey} className="flex flex-wrap gap-2 md:flex-col">
          {skills.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`skill-tab-${s.id}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`skill-panel-${s.id}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-lg border px-4 py-3 text-left text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent ${
                i === active
                  ? "border-accent bg-surface-2 font-semibold text-text"
                  : "border-line text-text-2 hover:border-text-2 hover:text-text"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div
          key={skill.id}
          id={`skill-panel-${skill.id}`}
          role="tabpanel"
          aria-labelledby={`skill-tab-${skill.id}`}
          tabIndex={0}
          className="animate-rise rounded-xl border border-line bg-surface p-6 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <h3 className="text-2xl font-semibold tracking-tight text-text">{skill.title}</h3>
          <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-text">{skill.summary}</p>

          <h4 className="mt-6 font-mono text-xs text-text-2">{t("skillsTools")}</h4>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {skill.tools.map((tool) => (
              <li key={tool} className="rounded border border-line px-2 py-0.5 font-mono text-xs text-text-2">
                {tool}
              </li>
            ))}
          </ul>

          <h4 className="mt-6 font-mono text-xs text-text-2">{t("skillsProof")}</h4>
          <ul className="mt-2 flex flex-col gap-2">
            {skill.proof.map((p) => (
              <li key={p} className="border-l-2 border-accent/50 pl-3 text-sm leading-relaxed text-text">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
