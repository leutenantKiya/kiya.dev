"use client";

import { useSeasonal } from "@/components/providers/SeasonalProvider";
import { useTranslation } from "@/hooks/useTranslation";

const base =
  "flex items-center gap-1.5 rounded-md border px-2 py-1.5 font-mono text-[11px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent";

function Equaliser() {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="eq-bar block h-full w-[2px] rounded-full bg-current"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

export function SeasonToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { mounted, festive, setFestive } = useSeasonal();
  const { t } = useTranslation();
  if (!mounted) return null;

  return (
    <button
      type="button"
      aria-pressed={festive}
      aria-label={t("xmasAria")}
      title={festive ? t("xmasOn") : t("xmasOff")}
      onClick={() => setFestive(!festive)}
      className={`${base} ${
        festive
          ? "border-line bg-surface-2 text-[var(--xmas-red)]"
          : "border-line text-text-2 hover:text-text"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M12 2v20M4.9 7l14.2 10M19.1 7 4.9 17M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5" />
      </svg>
      {showLabel && <span>{t("xmasLabel")}</span>}
    </button>
  );
}

export function MusicToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { mounted, festive, music, musicError, togglePlay, toggleMute } =
    useSeasonal();
  const { t } = useTranslation();
  if (!mounted || !festive) return null;

  const on = music !== "off";

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        aria-pressed={on}
        aria-label={t("musicAria")}
        title={on ? t("musicOn") : t("musicOff")}
        onClick={togglePlay}
        className={`${base} ${
          on
            ? "border-[var(--xmas-red)] bg-surface-2 text-[var(--xmas-red)]"
            : "border-line text-text-2 hover:text-text"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        {music === "playing" && <Equaliser />}
        {showLabel && <span>{t("musicLabel")}</span>}
      </button>

      {on && (
        <button
          type="button"
          aria-pressed={music === "muted"}
          aria-label={t("musicMuteAria")}
          title={t("musicMuteAria")}
          onClick={toggleMute}
          className={`${base} border-line ${
            music === "muted" ? "bg-surface-2 text-text" : "text-text-2 hover:text-text"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 5 6 9H2v6h4l5 4V5Z" />
            {music === "muted" ? (
              <path d="m22 9-6 6M16 9l6 6" />
            ) : (
              <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
            )}
          </svg>
        </button>
      )}

      <span role="status" aria-live="polite" className="sr-only">
        {musicError ? t("musicError") : ""}
      </span>
    </span>
  );
}
