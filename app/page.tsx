import fs from "node:fs";
import path from "node:path";
import { sections } from "@/lib/profile";
import { projects } from "@/lib/projects";
import { about } from "@/lib/about";
import { ProjectCard } from "@/components/work/ProjectCard";
import { LabIndex } from "@/components/lab/LabIndex";
import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { Contact } from "@/components/contact/Contact";
import { Hero } from "@/components/hero/Hero";
import { RevealSection } from "@/components/ui/RevealSection";

export default function Home() {
  // Same rule as the sidebar portrait: render only when the file exists.
  const portraitSrc = fs.existsSync(
    path.join(process.cwd(), "public", "me.png"),
  )
    ? "/me.png"
    : null;

  return (
    <>
      <Hero portraitSrc={portraitSrc} />

      <div className="mx-auto max-w-[720px] px-5 py-12 lg:px-12">
        {sections.map((section) => (
        <RevealSection
          key={section.id}
          id={section.id}
          className="scroll-mt-16 border-b border-line py-16 first:pt-4 last:border-b-0"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
            {section.label}
          </h2>

          {section.id === "work" ? (
            <div className="mt-6 flex flex-col gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : section.id === "lab" ? (
            <LabIndex />
          ) : section.id === "experience" ? (
            <ExperienceTimeline />
          ) : section.id === "about" ? (
            <div className="mt-6">
              {/* On mobile the sidebar portrait is just a header avatar — the
                  full portrait reappears once here (plan §9.1). */}
              {portraitSrc && (
                <img
                  src={portraitSrc}
                  alt="Portrait of Kiya"
                  width={160}
                  height={160}
                  className="mb-6 h-40 w-40 rounded-md border border-line object-cover object-top lg:hidden"
                />
              )}
              <div className="flex max-w-[65ch] flex-col gap-4">
                {about.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="text-sm leading-relaxed text-text-2"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
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
