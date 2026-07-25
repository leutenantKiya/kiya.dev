export const dictionary = {
    en: {
    backToWork: "← back to work",
    problem: "Problem",
    solution: "Solution",
    architecture: "Architecture",
    decisions: "Decisions & tradeoffs",
    status: "Status",
    year: "Year",
    context: "Context",
    repo: "Repository ↗",
    demo: "Live demo ↗",
  },
  id: {
    backToWork: "← kembali ke proyek",
    problem: "Masalah",
    solution: "Solusi",
    architecture: "Arsitektur",
    decisions: "Keputusan & Kompromi",
    status: "Status",
    year: "Tahun",
    context: "Konteks",
    repo: "Repositori ↗",
    demo: "Demo Langsung ↗",
  },
} as const;

export type TranslationKey = keyof typeof dictionary.en;