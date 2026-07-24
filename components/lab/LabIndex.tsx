import { artifacts, type Artifact } from "@/lib/lab";
import { about } from "@/lib/about";

const statusColor: Record<Artifact["status"], string> = {
  active: "bg-accent",
  done: "bg-text-2",
  archived: "bg-line",
};

function LabTile({ artifact }: { artifact: Artifact }) {
  const href = artifact.demo ?? artifact.repo ?? undefined;
  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper
      {...(href
        ? { href, target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group flex w-72 shrink-0 flex-col rounded-lg border border-line bg-bg p-4 transition-colors duration-150 hover:border-text-2 hover:bg-surface"
    >
      <div className="flex items-center gap-2 font-mono text-xs text-text-2">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusColor[artifact.status]}`}
          title={artifact.status}
        />
        <span>{artifact.year}</span>
        <span>· {artifact.type}</span>
        {href && (
          <span className="ml-auto text-text-2 transition-colors group-hover:text-accent">
            ↗
          </span>
        )}
      </div>

      <h3 className="mt-1.5 text-sm font-semibold tracking-tight text-text">
        {artifact.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-text-2">{artifact.purpose}</p>
      <p className="mt-2 font-mono text-xs text-accent">{artifact.insight}</p>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Stack">
        {artifact.stack.map((tech) => (
          <li
            key={tech}
            className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-text-2"
          >
            {tech}
          </li>
        ))}
      </ul>
    </Wrapper>
  );
}

/** One auto-scrolling row. The track holds the tiles twice so the -50%
 *  translate loops seamlessly. Pauses on hover; static + scrollable when
 *  reduced-motion is requested. */
function MarqueeRow({
  items,
  direction,
}: {
  items: Artifact[];
  direction: "left" | "right";
}) {
  const anim = direction === "left" ? "marquee-left" : "marquee-right";
  return (
    <div className="overflow-hidden motion-reduce:overflow-x-auto">
      <div
        className="flex w-max gap-3 hover:[animation-play-state:paused] motion-reduce:[animation:none]"
        style={{ animation: `${anim} 45s linear infinite` }}
      >
        {[...items, ...items].map((artifact, i) => (
          <LabTile key={`${artifact.name}-${i}`} artifact={artifact} />
        ))}
      </div>
    </div>
  );
}

export function LabIndex() {
  const half = Math.ceil(artifacts.length / 2);
  const rowA = artifacts.slice(0, half);
  const rowB = artifacts.slice(half);

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-text-2">{about.labLine}</p>

      {/* Full-bleed within the content column; hover any row to freeze it */}
      <div className="flex flex-col gap-3">
        <MarqueeRow items={rowA} direction="left" />
        <MarqueeRow items={rowB} direction="right" />
      </div>
    </div>
  );
}
