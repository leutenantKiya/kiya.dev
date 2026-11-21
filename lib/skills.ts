import skillsJson from "@/content/skills.json";
import type { Lang } from "@/components/providers/LanguageProvider";

export type Skill = {
  id: string;
  title: string;
  summary: string;
  tools: string[];
  proof: string[];
};

export function getSkills(lang: Lang): Skill[] {
  return skillsJson.map((s) => ({
    id: s.id,
    title: s.title[lang] ?? s.title.en,
    summary: s.summary[lang] ?? s.summary.en,
    tools: s.tools,
    proof: s.proof[lang] ?? s.proof.en,
  }));
}
