import fs from "node:fs";
import path from "node:path";
import { sections } from "@/lib/profile";
import { AboutText } from "@/components/about/AboutText";
import { WorkGrid } from "@/components/work/WorkGrid";
import { LabIndex } from "@/components/lab/LabIndex";
import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { Contact } from "@/components/contact/Contact";
import { Hero } from "@/components/hero/Hero";
import { RevealSection } from "@/components/ui/RevealSection";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function Home() {
  const portraitSrc = fs.existsSync(
    path.join(process.cwd(), "public", "me.png"),
  )
    ? "/me.png"
    : null;

  return (
    <>
      <Hero portraitSrc={portraitSrc} />

      <div className="mx-auto max-w-[880px] px-5 py-12 lg:px-12">
        {sections.map((section) => (
          <RevealSection
            key={section.id}
            id={section.id}
            className="scroll-mt-16 border-b border-line py-16 first:pt-8 last:border-b-0 lg:py-24"
          >
            <SectionTitle sectionId={section.id} />

            {section.id === "work" ? (
              <WorkGrid />
            ) : section.id === "lab" ? (
              <LabIndex />
            ) : section.id === "experience" ? (
              <ExperienceTimeline />
            ) : section.id === "about" ? (
              <div className="mt-6">
                {portraitSrc && (
                  <img
                    src={portraitSrc}
                    alt="Portrait of Kiya"
                    width={160}
                    height={160}
                    className="mb-6 h-40 w-40 rounded-md border border-line object-cover object-top lg:hidden"
                  />
                )}
                <AboutText />
              </div>
            ) : section.id === "contact" ? (
              <Contact />
            ) : null}
          </RevealSection>
        ))}
      </div>
    </>
  );
}
