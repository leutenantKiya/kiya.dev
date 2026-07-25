import experienceJson from "@/content/experience.json";
import type { Lang } from "@/components/providers/LanguageProvider";

export type Experience = {
  org: string;
  role: string;
  start: string;
  end: string | "present";
  type: "work" | "education" | "hackathon" | "project" | "organization";
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experience: Experience[] = experienceJson as Experience[];

export function getExperiences(lang: Lang): Experience[] {
  return experienceJson.map((e) => {
    const raw = e as Record<string, unknown>;
    return {
      org: e.org,
      role: lang === "id" && raw.role_id ? (raw.role_id as string) : e.role,
      start: e.start,
      end: (lang === "id" && e.end === "present" ? "sekarang" : e.end) as Experience["end"],
      type: e.type as Experience["type"],
      summary: lang === "id" && raw.summary_id ? (raw.summary_id as string) : e.summary,
      highlights:
        lang === "id" && raw.highlights_id
          ? (raw.highlights_id as string[])
          : e.highlights,
      stack: e.stack,
    };
  });
}
