import labJson from "@/content/lab.json";
import type { Lang } from "@/components/providers/LanguageProvider";

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

export const artifacts: Artifact[] = labJson as Artifact[];

export function getLabEntries(lang: Lang): Artifact[] {
  return labJson.map((item) => {
    const raw = item as Record<string, unknown>;
    return {
      ...item,
      status: item.status as Artifact["status"],
      purpose: lang === "id" && raw.purpose_id ? (raw.purpose_id as string) : item.purpose,
      insight: lang === "id" && raw.insight_id ? (raw.insight_id as string) : item.insight,
    };
  });
}
