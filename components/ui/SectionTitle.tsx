"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getSections } from "@/lib/profile";

export function SectionTitle({ sectionId }: { sectionId: string }) {
  const { lang } = useLanguage();
  const sections = getSections(lang);
  const section = sections.find((s) => s.id === sectionId);

  return (
    <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
      {section?.label ?? sectionId}
    </h2>
  );
}
