"use client";

import { getAbout } from "@/lib/about";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AboutText() {
  const { lang } = useLanguage();
  const aboutData = getAbout(lang);

  return (
    <div className="flex max-w-[65ch] flex-col gap-4">
      {aboutData.paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 24)}
          className="text-sm leading-relaxed text-text-2"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
