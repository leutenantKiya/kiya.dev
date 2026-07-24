import experienceJson from "@/content/experience.json";

export type Experience = {
  org: string;
  role: string;
  start: string;
  end: string | "present";
  type: "work" | "education" | "hackathon" | "organization";
  summary: string;
  highlights: string[];
  stack: string[];
};

// Content lives in content/experience.json — edit there, types are enforced here.
// Entries render newest-first in the order they appear in the JSON array.
export const experience: Experience[] = experienceJson as Experience[];
