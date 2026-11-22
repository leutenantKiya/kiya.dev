import fs from "node:fs";
import path from "node:path";
import { sections } from "@/lib/profile";
import { ProjectFolders } from "@/components/work/ProjectFolders";
import { SkillTabs } from "@/components/skills/SkillTabs";
import { LabIndex } from "@/components/lab/LabIndex";
import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { Contact } from "@/components/contact/Contact";
import { Hero } from "@/components/hero/Hero";
import { RevealSection } from "@/components/ui/RevealSection";
import { SectionTitle } from "@/components/ui/SectionTitle";

const SECTION = {
  work: ProjectFolders,
  skills: SkillTabs,
  experience: ExperienceTimeline,
  lab: LabIndex,
  contact: Contact,
} as const;

export default function Home() {
  const portraitSrc = fs.existsSync(path.join(process.cwd(), "public", "me.png")) ? "/me.png" : null;

  return (
    <>
      <Hero portraitSrc={portraitSrc} />

      <div className="mx-auto max-w-[1040px] px-5 py-12 lg:px-12">
        {sections.map((section) => {
          const Body = SECTION[section.id as keyof typeof SECTION];
          if (!Body) return null;
          return (
            <RevealSection
              key={section.id}
              id={section.id}
              className="scroll-mt-24 border-b border-line py-16 first:pt-8 last:border-b-0 lg:py-24"
            >
              <SectionTitle sectionId={section.id} />
              <Body />
            </RevealSection>
          );
        })}
      </div>
    </>
  );
}
