import profileJson from "@/content/profile.json";

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
  /** Path to combined resume/CV PDF in /public. Null until the file is added —
   *  the sidebar button only renders when this is set. */
  resume: string | null;
  sections: Section[];
};

// Content lives in content/profile.json — edit there, types are enforced here.
export const profile: Profile = profileJson;

export const sections: Section[] = profile.sections;
