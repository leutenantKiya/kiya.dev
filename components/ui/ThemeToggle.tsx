"use client";

import { useTheme, type Theme } from "@/components/providers/ThemeProvider";

const options: {
  value: Theme;
  label: string;
  iconTitle: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "light",
    label: "Light",
    iconTitle: "Switch to light theme",
    icon: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    iconTitle: "Switch to dark theme",
    icon: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "Auto",
    iconTitle: "Use system theme settings",
    icon: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    ),
  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme mode"
      className="inline-flex items-center rounded-md border border-line font-mono text-xs"
    >
      {options.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            title={option.iconTitle}
            aria-label={option.iconTitle}
            aria-pressed={active}
            onClick={() => setTheme(option.value)}
            className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors duration-150 first:rounded-l-md last:rounded-r-md focus-visible:outline-2 focus-visible:outline-accent ${
              active
                ? "bg-surface-2 text-accent"
                : "text-text-2 hover:text-text"
            }`}
          >
            {option.icon}
            <span className="hidden sm:inline text-[11px]">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
