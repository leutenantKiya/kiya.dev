import labJson from "@/content/lab.json";

export type Artifact = {
  name: string;
  type: string;
  year: string;
  stack: string[];
  purpose: string;
  status: "active" | "done" | "archived";
  repo: string | null;
  demo: string | null;
  insight: string;
};

// Content lives in content/lab.json — edit there, types are enforced here.
export const artifacts: Artifact[] = labJson as Artifact[];
