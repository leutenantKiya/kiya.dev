"use client";

import { profile } from "@/lib/profile";
import { projects } from "@/lib/projects";
import { artifacts } from "@/lib/lab";
import { useTranslation } from "@/hooks/useTranslation";

// Every tool that appears in the content, once: the strip grows as projects are added.
const tools = Array.from(
  new Set([
    ...profile.pills,
    ...projects.flatMap((p) => p.stack),
    ...artifacts.flatMap((a) => a.stack),
  ]),
);

export function StackMarquee() {
  const { t } = useTranslation();

  return (
    <section aria-label={t("stackLabel")} className="relative overflow-hidden border-b border-line py-5">
      <div className="group flex w-max gap-3 [animation:marquee_60s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:[animation:none]">
        {[...tools, ...tools].map((tool, i) => (
          <span
            key={`${tool}-${i}`}
            aria-hidden={i >= tools.length}
            className="shrink-0 rounded-full border border-line px-3 py-1 font-mono text-xs text-text-2"
          >
            {tool}
          </span>
        ))}
      </div>
    </section>
  );
}
