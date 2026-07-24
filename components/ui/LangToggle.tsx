"use client";

import { useLanguage, type Lang } from "@/components/providers/LanguageProvider";

const options: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "id", label: "ID" },
];

export function LangToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-md border border-line font-mono text-xs"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={lang === option.value}
          onClick={() => setLang(option.value)}
          className={`px-2.5 py-1.5 transition-colors duration-150 first:rounded-l-md last:rounded-r-md focus-visible:outline-2 focus-visible:outline-accent ${
            lang === option.value
              ? "bg-surface-2 text-accent"
              : "text-text-2 hover:text-text"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
