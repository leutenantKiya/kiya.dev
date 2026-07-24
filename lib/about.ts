import aboutJson from "@/content/about.json";

export type About = {
  paragraphs: string[];
  contactLine: string;
  labLine: string;
};

// Content lives in content/about.json — edit there, types are enforced here.
export const about: About = aboutJson;
