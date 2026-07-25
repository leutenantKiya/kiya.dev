import aboutJson from "@/content/about.json";
import type { Lang } from "@/components/providers/LanguageProvider";

export type LocalizedText = {
  en: string;
  id: string;
};

export type LocalizedArray = {
  en: string[];
  id: string[];
};

export type About = {
  paragraphs: LocalizedArray;
  contactLine: LocalizedText;
  labLine: LocalizedText;
};

export const about: About = aboutJson;

export function getAbout(lang: Lang) {
  return {
    paragraphs: aboutJson.paragraphs[lang] || aboutJson.paragraphs.en,
    contactLine: aboutJson.contactLine[lang] || aboutJson.contactLine.en,
    labLine: aboutJson.labLine[lang] || aboutJson.labLine.en,
  };
}
