"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getSections } from "@/lib/profile";

export function SectionTitle({ sectionId }: { sectionId: string }) {
  const { lang } = useLanguage();
  const sections = getSections(lang);
  const section = sections.find((s) => s.id === sectionId);

  return (
    <h2 className="text-3xl font-semibold tracking-tight text-text [text-wrap:balance] sm:text-4xl">
      {section?.label ?? sectionId}
    </h2>
  );
}
