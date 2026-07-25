import projectsJson from "@/content/projects.json";
import type { Lang } from "@/components/providers/LanguageProvider";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  year: string;
  status: string;
  stack: string[];
  repo: string;
  demo: string | null;
  role: string;
  preview: string | string[] | null;
  previews?: string[];
  video?: string | null;
};

export const projects: Project[] = projectsJson;

export function getProjects(lang: Lang): Project[] {
  return projectsJson.map((p) => {
    const raw = p as Record<string, unknown>;
    return {
      ...p,
      tagline: lang === "id" && raw.tagline_id ? (raw.tagline_id as string) : p.tagline,
      summary: lang === "id" && raw.summary_id ? (raw.summary_id as string) : p.summary,
    };
  });
}

export function getProject(slug: string, lang: Lang = "en"): Project {
  const all = getProjects(lang);
  const project = all.find((p) => p.slug === slug);
  if (!project) throw new Error(`Unknown project slug: ${slug}`);
  return project;
}
