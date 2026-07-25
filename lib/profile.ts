import profileJson from "@/content/profile.json";
import type { Lang } from "@/components/providers/LanguageProvider";

export type Social = {
  platform: string;
  handle: string;
  url: string;
};

export type Section = {
  id: string;
  label: string;
};

export type Profile = {
  name: string;
  title: string;
  bio: string;
  pills: string[];
  email: string;
  socials: Social[];
  resume: string | null;
  sections: Section[];
};

export const profile: Profile = profileJson;
export const sections: Section[] = profile.sections;

export function getProfile(lang: Lang): Profile {
  const p = profileJson as Record<string, unknown>;
  return {
    ...profileJson,
    title: lang === "id" && p.title_id ? (p.title_id as string) : profileJson.title,
    bio: lang === "id" && p.bio_id ? (p.bio_id as string) : profileJson.bio,
    sections: getSections(lang),
  };
}

export function getSections(lang: Lang): Section[] {
  return profileJson.sections.map((s) => ({
    id: s.id,
    label: lang === "id" && "label_id" in s ? (s as { label_id: string }).label_id : s.label,
  }));
}
