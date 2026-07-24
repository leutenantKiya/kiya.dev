import projectsJson from "@/content/projects.json";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  /** 10-second summary: Problem → Solution → Stack → Impact, readable by a non-technical visitor. */
  summary: string;
  year: string;
  status: string;
  stack: string[];
  repo: string;
  demo: string | null;
  role: string;
  /** Screenshot/snapshot URL — floating preview on desktop hover, inline
   *  thumbnail on mobile. Null hides the preview entirely. */
  preview: string | null;
};

// Content lives in content/projects.json — edit there, types are enforced here.
// A project card links to /work/<slug>, so every entry needs a matching
// app/work/<slug>/page.mdx case-study page before it ships.
export const projects: Project[] = projectsJson;

export function getProject(slug: string): Project {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Unknown project slug: ${slug}`);
  return project;
}
