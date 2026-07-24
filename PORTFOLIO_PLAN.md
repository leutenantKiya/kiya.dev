# PORTFOLIO_PLAN.md — kiya.dev

> Planning document only. No application code exists yet. Awaiting explicit approval (YES / NO / MODIFY) before implementation.
>
> Prepared: 2026-07-24 · GitHub account audited: `leutenantKiya` (authenticated via `gh`, scopes: repo, workflow) · Workspace audited: `D:\code progression`

---

## PHASE 1 — AUDIT SUMMARY

### Access verified

- GitHub CLI authenticated as **leutenantKiya** — 24 repositories enumerated (public + private).
- Local workspace inspected: `D:\code progression\` including `ALL PROJECT ARE HERE\`, `web3'\`, `websitest\`, `face recognition\`, and coursework directories.
- `kiya.dev` repo exists and is empty (no commits) — a clean slate for this portfolio.

### Full repository inventory (verified)

| Repo | Language(s) | Last push | Assessment |
|---|---|---|---|
| **Arbor** | TS 378KB, HTML, Solidity, PLpgSQL | 2026-07-20 | Hackathon product, rich README, complete concept |
| **lazy_builder** | TS 65KB | 2026-06-28 | Dev tool: canvas + editor + React export, detailed DOCS.md |
| **Nutrify-Food-Recognition…** | Jupyter 12MB, Dart 436KB, Python | 2026-05-27 | ML pipeline + Flutter app + FastAPI |
| **AILY-Ecommerce-chatbotService** | Java 214KB, Python 116KB | 2026-06-06 | NLP intent-router chatbot, FastAPI + JavaFX |
| **JustPush-Refactory** | TS 110KB, Dockerfile | 2025-12-07 | Deployment automation tool |
| **PaxPatronage-crowd-fundraising** | PHP 81KB, CSS, JS | 2026-06-07 | Crowdfunding web app |
| **telegramBot** | Python 69KB, Dockerfile | 2026-05-03 | Bot + Docker |
| **nextjs-with-supabase** (private) | TS | 2026-07-10 | Scaffold-stage |
| **PKM---company-profile** | Vue | 2025-10-10 | Client-style site |
| **Hydrostatic-Pressure-Prediction-ML-Regression** | Jupyter | 2025-06-24 | ML regression experiment |
| **SO_Bankers_Alghoritm** | JavaScript | 2025-12-10 | OS algorithm visualization/coursework |
| **Nutrify dataset sources, others** | — | — | See archived list |
| to-do, Birthday-Celebration, foodWeb, website-latihan, Last-Semester-Project, project-akhir-kelompok, sinau, PrAlPro-Repository, ug8-struktur-data (fork), study_git, leutenantKiya (profile) | mixed | various | Learning/coursework — archive |

Local-only findings: `lumastream` (fresh Next.js 16 scaffold, no product yet), `Social-Media-Summer-Project` (PHP social app), `face recognition` (OpenCV Haar cascade script), `websitest` (JS mini-projects: calculator, quiz games, DOM practice), `snake.py`, `wordl.py`, `tictactoe.c`.

**Verification policy applied:** no deployments, metrics, user counts, or impact numbers were found for any project. All such fields below are marked `Unknown / Not found`. Nothing is invented.

⚠️ Security note found during audit: `D:\code progression\5nSeaport\privateKey.txt` exists on disk. Not read, not part of this plan — recommend deleting/rotating whatever it contains.

---

## PHASE 1A — TECHNOLOGY LANDSCAPE

### Frequency across projects (verified from language stats + manifests)

- **Languages:** TypeScript (dominant: Arbor, lazy_builder, JustPush, lumastream), Python (Nutrify, AILY NLP, telegramBot, ML experiments), Java (AILY), Dart (Nutrify Flutter), PHP (PaxPatronage, Social-Media), Solidity (Arbor), C/C++ (coursework).
- **Frontend:** React 19, Next.js 16, Vue (once), Flutter, JavaFX, Tailwind CSS 4, TipTap, Yjs (CRDT).
- **Backend:** FastAPI (×2: Nutrify, AILY), Node/tsx WebSocket server (lazy_builder), Express-style servers, PHP.
- **Data:** Postgres (Arbor ledger, PLpgSQL present), JDBC, SQL.
- **ML/AI:** multi-model vision pipeline (detection + classification), Kaggle datasets, regression models, Gemini API integration, NLP intent routing.
- **Web3:** Solidity (`ArborVault.sol`), Particle Network account abstraction, gasless transactions, Arbitrum/Base Sepolia, USDC settlement.
- **DevOps:** Docker (telegramBot, JustPush), GitHub workflow scope, deployment automation (JustPush itself).
- **Real-time:** WebSockets, Yjs CRDT sync.

### Reading of the evidence

1. **Most used:** TypeScript + React on the front, Python (FastAPI) on the back, Postgres/SQL for data.
2. **Emerging:** account-abstraction Web3 (Arbor), CRDT/real-time collaboration (lazy_builder), applied ML pipelines (Nutrify).
3. **Strongest identity:** building *complete products* — every notable project has a frontend, a backend, a data layer, and a written product rationale (personas, planning docs, UX strategy). The READMEs consistently lead with the user problem, not the tech.
4. **Should not dominate:** PHP, Java/JavaFX, Vue, C — real experience, wrong headline. Web3 specifically should be framed as *an implementation detail Arbor hides from users* — which is itself the strongest UX story in the portfolio — not as a "blockchain developer" identity.

### Recommended positioning (challenging the default)

**Product Engineer** — primary. Not "Full-Stack Developer" (generic, undersells the product thinking) and not pure "Design Engineer" (the evidence is deeper on systems — ledgers, ML pipelines, CRDTs — than on motion/visual craft). The distinctive pattern across Arbor, Lazy Builder, and Nutrify is: *identify a real friction → design the product around hiding complexity → build the whole system end-to-end.* Arbor hides blockchain behind Google login; Lazy Builder hides the design–code gap behind a linked canvas/editor; Nutrify hides nutrition math behind a camera.

**Secondary positioning:** Full-stack systems — comfortable across web, mobile, ML, and smart contracts.

The "Design Engineer Hybrid" *visual language* is still right for the site itself (it demonstrates front-end craft), but the *label* should be Product Engineer.

---

## PHASE 1B — PROJECT DISCOVERY

### A. HERO CASE STUDIES (4)

#### 1. Arbor — pay-per-minute streaming for independent cinema
- **Repo:** github.com/leutenantKiya/Arbor · **Stack:** React + TypeScript, Solidity (`ArborVault.sol`), Particle Network Universal Accounts, Postgres ledger, Base Sepolia testnet
- **Why hero #1:** strongest product narrative in the account. Real economic insight (card networks can't settle $0.08 micro-charges), a genuinely invisible-Web3 architecture (social login → silent wallet → gasless USDC), and a hybrid on-chain/off-chain design (money moments on-chain, per-second metering in a server-side ledger). Built in 7 days for the Encode Club UXMaxx Hackathon in a 3-person team.
- **Problem:** subscriptions punish light viewers; micro-payments are uneconomical on card rails; indie filmmakers get opaque, delayed payouts.
- **Solution:** prepaid viewing time, metered only during playback; filmmakers settled on-chain pro-rata per second watched.
- **Architecture highlight:** off-chain debit ledger + batch on-chain settlement — the single best diagram candidate in the whole portfolio.
- **Deployment:** **Live at https://arbor-watch.vercel.app** (verified 2026-07-24 — page serves "Arbor — Pay for what you watch"). Metrics: Unknown / Not found.
- **Visual treatment:** flagship. Deep case study with the payment-flow diagram, the "anti-anxiety meter" UX decision, and the Filmmaker Studio screen. Prominent "Live demo ↗" button.
- **10-second summary:** *Streaming subscriptions charge you for time you never watch. Arbor sells prepaid viewing hours that only tick down while a film plays — filmmakers get paid per second watched, settled automatically on-chain. React + TypeScript, Solidity, Postgres. Built in 7 days by a team of 3 for the Encode UXMaxx hackathon.*

#### 2. Lazy Builder — visual React builder with linked documentation
- **Repo:** github.com/leutenantKiya/lazy_builder · **Stack:** React 19, Vite, TypeScript, Yjs (CRDT), TipTap, y-websocket relay, Tailwind 4
- **Why hero:** it's a *developer tool* — the most credibility-dense category for a portfolio. Real-time CRDT collaboration, an infinite canvas with drag/resize/snap/group, a slash-command editor, cross-surface reference pills, and export to a runnable React + Vite project.
- **Problem:** Figma→code handoff is lossy; low-code builders emit unmaintainable code; docs live disconnected from components.
- **Solution:** linked Figma-like canvas + Notion-like editor, exporting clean `src/components/*.tsx`.
- **Architecture highlight:** Yjs CRDT sync over a minimal WebSocket relay; canvas node types as an IR that compiles to React source.
- **Deployment / metrics:** Unknown / Not found.
- **Visual treatment:** interactive-leaning case study — even a short screen recording or embedded canvas demo would carry it. Second-deepest write-up.
- **10-second summary:** *Design tools and code live in separate worlds, and translating between them loses information. Lazy Builder is a Figma-style canvas glued to a Notion-style editor that exports real, runnable React code. React, TypeScript, CRDT real-time sync. Personal developer-tool project.*

#### 3. Nutrify — food recognition & daily nutrition scheduler
- **Repo:** github.com/leutenantKiya/Nutrify-Food-Recognition-And-Daily-Food-Scheduler · **Stack:** Flutter, FastAPI, multi-model ML pipeline (detection + classification + portion estimation), Gemini-powered chat, Kaggle datasets
- **Why hero:** demonstrates applied ML shipped inside a real app, not a notebook. Photo → detect → classify → estimate portion → compute macros → compare to the user's daily goal. Local inference (no API key needed for the pipeline).
- **Problem:** calorie tracking is manual and tedious, so people quit.
- **Solution:** point the camera at food; the system identifies it, estimates portion, and tells you whether it fits your goal (cut / bulk / maintain).
- **Architecture highlight:** ML orchestration layer in FastAPI coordinating multiple models plus a nutrition database and recommendation engine.
- **Deployment / metrics:** Unknown / Not found.
- **Visual treatment:** pipeline-diagram case study (camera → models → macros → recommendation). Mobile screenshots if available.
- **10-second summary:** *Logging food by hand is why diet apps fail. Nutrify identifies a meal from a photo, estimates the portion, computes calories and macros, and tells you if it fits your goal. Flutter, FastAPI, multi-model ML pipeline. University capstone-scale project.*

#### 4. AILY — e-commerce chatbot service
- **Repo:** github.com/leutenantKiya/AILY-Ecommerce-chatbotService · **Stack:** FastAPI (Python NLP core), JavaFX frontend, JDBC/SQL, key-based auth
- **Why hero (4th slot):** clean backend architecture story — NLP → intent router → 11 specialized handlers (FAQ, cart, checkout, tracking, admin CRUD, fallback…), role-separated user/admin endpoints. Shows systems decomposition and cross-language integration (Python service + Java client).
- **Problem:** e-commerce support requires humans for mostly-routine queries.
- **Solution:** intent-routed chatbot handling catalog search, cart, checkout, order tracking, and admin product management.
- **Deployment / metrics:** Unknown / Not found. Some build stages unchecked in README — present honestly as an architecture-focused study.
- **Visual treatment:** lightest of the four — an intent-router diagram and a handler table. Could be demoted to Lab if 3 heroes feel tighter.
- **10-second summary:** *Most store questions are routine, but answering them still takes staff. AILY parses natural-language messages, routes them to the right handler — search, cart, checkout, tracking — and answers automatically. Python NLP service + Java client + SQL. Team project.*

### B. LAB / MINI-ARTIFACTS

| Artifact | Type | Stack | One-line insight |
|---|---|---|---|
| JustPush-Refactory | DevOps tool | TypeScript, Docker | Deployment automation with reliability focus |
| telegramBot (Aily bot) | Bot | Python, Docker | Containerized Telegram automation |
| PaxPatronage | Web app | PHP, JS | Crowd-fundraising platform, classic LAMP-style build |
| SO_Bankers_Alghoritm | Visualization | JavaScript | Banker's deadlock-avoidance algorithm, interactive |
| Hydrostatic Pressure Prediction | ML experiment | Jupyter, sklearn-style regression | Physical-system regression modeling |
| Face recognition | CV script | Python, OpenCV Haar cascade | Classical CV before deep learning |
| PKM company profile | Client site | Vue | Company-profile site build |
| Social-Media-Summer-Project | Web app | PHP | Auth + timeline + profiles from scratch |
| Mini-games (snake, wordle, tictactoe) | Toys | Python, C | Optional playful entries |

### C. ARCHIVED / LOW PRIORITY

to-do, Birthday-Celebration, foodWeb, website-latihan, websitest exercises, study_git, sinau, PrAlPro-Repository, ug8-struktur-data fork, Last-Semester-Project, project-akhir-kelompok, nextjs-with-supabase (scaffold), lumastream (scaffold — revisit if it becomes a real product), leutenantKiya profile repo. These stay off the portfolio.

---

## DESIGN RESEARCH & CREATIVE DIRECTION

### References consulted

- Awwwards dark-mode and portfolio-layout collections ([portfolio layouts](https://www.awwwards.com/inspiration/portfolio-layout), [dark mode collection](https://www.awwwards.com/awwwards/collections/dark-mode/)) — notable: Isabel Moranta's SOTD portfolio (dual typography: monospace for precision, expressive face for personality; dark "gallery" background where work emerges like exhibits).
- [Muzli's 2026 top-100 portfolio roundup](https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/) and [engineer-portfolio surveys](https://www.sitebuilderreport.com/inspiration/engineer-portfolios) — consistent finding: for engineers, the winning format is **project-first, text-forward, 3–5 case studies with stack + outcomes + working links**, not visual spectacle.
- [DESIGN.md full-stack portfolio system](https://designmd.app/library/portfolio-dev-full-stack/) — dark surfaces, JetBrains Mono metadata, single restrained accent, minimal navigation.
- Colorlib/portfolio-trend surveys — motion used to demonstrate interaction competence, not decoration; text-heavy layouts read as professionalism for technical audiences.

### Principles extracted

1. **Content-first wins for engineers.** Curated case studies with verifiable links outperform art direction. The riskiest failure mode is decoration outpacing substance.
2. **Dual typography = dual audience.** Sans/editorial voice for narrative (non-technical readers), monospace for metadata — stack, dates, repo links (technical readers). This one device serves both audiences without dumbing anything down.
3. **Dark gallery background** makes project artifacts (diagrams, screenshots) the brightest objects on screen — hierarchy through luminance, not ornament.
4. **Persistent identity + scrolling work** (the split-pane instinct) is a proven pattern: the visitor never loses "who is this / what do they do" while browsing.
5. **Motion as evidence.** For a Product Engineer claiming UX sensitivity, the site's own interactions *are* a portfolio piece — springs on real interactions, nothing ambient.

### Verdict on the starting hypothesis

**Keep the Tactile Split-Pane / Design Engineer Hybrid — refined, not replaced.** The split-pane fits the content: a stable identity rail + a deep scrolling work column suits 4 case studies + a lab index. Refinements: (a) label the identity "Product Engineer," (b) bias the design toward editorial/text-forward rather than interaction-maximalist, (c) let "tactile" mean precise, springy, restrained feedback — not skeuomorphism or heavy 3D.

---

## PHASE 2 — PORTFOLIO ARCHITECTURE & CONTENT BLUEPRINT

### 1. Personal positioning

- **Title:** Product Engineer
- **Primary positioning:** builds complete products end-to-end — interface, backend, data, and the hard part in the middle (payments, ML, real-time sync).
- **Secondary positioning:** full-stack systems range: web, mobile, ML pipelines, smart contracts.
- **Work to attract:** product-engineering roles at startups/product teams, hackathon teams, early-stage collaborations; secondarily freelance full-stack builds.

**Sidebar bio (draft):**

> I build complete products — the interface people touch, the systems underneath, and the complexity hidden in between. From a streaming platform that meters payment by the second to a canvas tool that exports real React code, I care most about making hard systems feel simple.

**Technology pills (max 8):** TypeScript · React · Next.js · Python · FastAPI · Postgres · Solidity · Flutter

(Deliberately excluded from pills: PHP, Java, Vue, Docker, C — they appear in project metadata instead, so nothing is hidden, just not headlined.)

### 2. Hero project selection

Order: **Arbor → Lazy Builder → Nutrify → AILY** (strongest narrative first; alternating flavor: web3-product / dev-tool / ML-mobile / backend-architecture shows range deliberately).

Per-project details and 10-second summaries: see Phase 1B above (single source of truth).

Case-study depth: Arbor full-depth (~1000 words + 2 diagrams), Lazy Builder deep (~700 + demo media), Nutrify medium (~500 + pipeline diagram), AILY compact (~350 + router diagram).

Every case study follows the same skeleton: **10-second summary → problem → solution → architecture diagram → decisions & tradeoffs → stack → links → honest status.** An explicit "Status" field (e.g., "Hackathon MVP, testnet") converts the lack of production metrics from a weakness into credibility.

### 3. Lab / mini-artifacts index

**Presentation:** hybrid — dense rows (workbench feel) that expand inline to a detail panel. Not cards; cards inflate small projects.

**Metadata fields per artifact:**
`name` · `type` (tool / bot / experiment / visualization / site / game) · `year` · `stack[]` · `purpose` (one line) · `status` (active / done / archived) · `repo` · `demo?` · `insight` (one technical takeaway line)

**Filters:** by type and by technology (pill toggles). **Search:** client-side fuzzy match on name + purpose + stack (~10–15 items — trivial, instant). **Sort:** newest first (default), by type.

Each row renders like an engineer's ledger entry: `2025 · SO_Bankers_Alghoritm · visualization · JS` with the insight line in monospace underneath when expanded.

### 4. Information architecture

**One page + case-study routes.** Not a multi-page site — content volume doesn't justify it.

```
Desktop (≥1024px)
┌─────────────┬──────────────────────────────┐
│ FIXED       │ SCROLLING                    │
│ SIDEBAR     │                              │
│ (~340px)    │  1. Hero projects (4)        │
│             │     – summary card each,     │
│  Name       │       expands to /work/slug  │
│  Title      │  2. Lab (filterable index)   │
│  Bio        │  3. Experience (timeline)    │
│  Tech pills │  4. About (short)            │
│  Section    │  5. Contact                  │
│  nav        │  6. Jar (v1.1 — §9.2)        │
│  Section    │                              │
│  nav w/     │  /work/[slug] = full case    │
│  scroll-spy │  study, same sidebar         │
│  Links      │                              │
└─────────────┴──────────────────────────────┘
```

- Sidebar: identity block (topped by the `[PERSONAL PORTRAIT / PHOTO]` slot — see §9.1), active-section indicator (scroll-spy), then a **document row** and a **social row** (never scrolls):
  - **Document row:** single download button — `Resume ↓` — one combined resume/CV PDF (confirmed by Kiya, 2026-07-24), served as `/public/resume.pdf` with the `download` attribute so it saves rather than navigates. Monospace label, hairline border, accent on hover. Renders only once the file exists.
  - **Social row:** icon links (Lucide icons, `text-2` color, accent on hover, new tab). Verified so far: **GitHub** (github.com/leutenantKiya) and **email** (click-to-copy nogbyak@gmail.com). Other handles (LinkedIn, X/Twitter, Instagram, Telegram, etc.) not found on the GitHub profile — must be supplied by Kiya; placeholders will not ship.
- Main column: max-width ~720px for prose; diagrams may bleed wider.
- Case studies live at `/work/[slug]` — shareable URLs, sidebar persists for context.
- **Mobile:** sidebar collapses to a compact sticky header (name + title + menu button). Content becomes a single column: intro block (bio + pills) → heroes → lab → about/contact. No split pane below ~1024px — the pattern must yield, not shrink.
- Visitor comprehension target: who/what within 3 seconds (sidebar), first project summary within 10 seconds (first hero card above the fold).

### 5. Visual & interaction system

**Dark mode first** (light mode optional later, not in v1 scope).

**Color**

| Token | Value | Use |
|---|---|---|
| `bg` | `#0A0A0B` | Page background (near-black, slightly warm) |
| `surface` | `#111113` | Cards, lab rows, code blocks |
| `surface-2` | `#1A1A1D` | Hover/expanded states |
| `text` | `#EDEDEF` | Primary text |
| `text-2` | `#9E9EA6` | Secondary text, metadata |
| `border` | `#26262B` | 1px hairlines — the "tactile" structure |
| `accent` | `#4ADE80` (green) | Links, active nav, focus rings, cursor accents |
| `ok / warn` | green / amber | Status dots in Lab (active/archived) |

One accent only. Green reads terminal/growth and stays legible on near-black. No gradients, no glow. Borders and luminance do the hierarchy work.

**Typography**

- **Interface + editorial:** Geist Sans — modern, engineered voice, excellent free variable font.
- **Metadata + code:** Geist Mono or JetBrains Mono — stack pills, dates, statuses, file paths, lab rows.
- Scale: 15–16px body, ~1.7 line-height for case-study prose; monospace always smaller (13px) and letter-spaced for labels.
- Inter = fallback safety; IBM Plex = rejected (strong IBM association).

**Motion** (Motion / Framer Motion)

- Entrance: single staggered fade+8px-rise on first load (~400ms total). Once, not per-scroll-section.
- Scroll: native. No hijacking, no parallax.
- Hover: 120ms border/color transitions; lab rows get a subtle background shift.
- Expansion (lab rows, project cards): spring, `stiffness ~300, damping ~30` — fast settle, no wobble. This is where "tactile" lives.
- `prefers-reduced-motion`: all transforms off, opacity-only, instant expansions.

**Interaction**

- **Cmd/Ctrl+K palette:** navigation only — jump to project/section, copy email, open GitHub/CV. It's justified here (an engineer-tool idiom that demonstrates craft) but stays small: ~10 commands, no plugins-style bloat. Footer hint: `⌘K to navigate`.
- Keyboard: full tab order, visible focus rings (accent), `↑↓ + Enter` in palette and lab list.
- Copy actions: email click-to-copy with inline "copied" feedback.
- External links: new tab + `↗` glyph, real `<a>` tags.
- Scroll-to-section: smooth scroll, scroll-spy updates sidebar nav.

### 6. Technical stack & architecture

| Tech | Verdict | Why |
|---|---|---|
| **Next.js (App Router, static export)** | Essential | Per-case-study routes + metadata/OG per project + MDX pipeline + Vercel deploy. All pages statically generated — this is a content site; zero server runtime. |
| **React 19** | Essential | Comes with Next; matches the strongest skill signal in the audit. |
| **Tailwind CSS 4** | Essential | Already used in Arbor/lazy_builder; tokens above map directly to a Tailwind theme. |
| **MDX** | Essential | Case studies are long-form prose + embedded components (diagrams, stack tables). MDX is exactly this. |
| **Motion (Framer Motion)** | Optional-but-included | Springs and palette animation; small scope. CSS transitions cover the rest. |
| **cmdk** | Optional-but-included | Battle-tested palette primitive; not worth hand-rolling. |
| **Lucide icons** | Optional | A handful of icons (external-link, copy, GitHub). Tiny footprint. |
| **JSON/TS data files** | Essential | Lab artifacts + skills as typed data. |
| CMS | **Rejected** | One author, ~15 content items, git is the CMS. Adds infra for zero benefit. |
| CSS Modules | Rejected | Tailwind covers it; two styling systems is one too many. |
| **Vercel** | Recommended | Zero-config Next deploy, preview URLs, custom domain for kiya.dev. |

**Directory sketch (proposal only — not created):**

```
app/
  layout.tsx            # split-pane shell + sidebar
  page.tsx              # heroes + lab + about + contact
  work/[slug]/page.tsx  # MDX case studies
components/
  sidebar/  work/  lab/  palette/  ui/
content/
  work/arbor.mdx  lazy-builder.mdx  nutrify.mdx  aily.mdx
  lab.ts  profile.ts   # typed data
lib/                    # scroll-spy, palette actions, utils
```

### 7. Content model

- **Hero projects → MDX** with typed frontmatter: `title, slug, summary10s, problem, solution, stack[], role, year, status, repo, demo?, diagram?`. Prose needs rich formatting; MDX gives components-in-content.
- **Lab artifacts → `lab.ts`** typed array (fields in §3). Uniform, short, filterable — data, not documents.
- **Profile/skills/links → `profile.ts`.** Single object: bio, pills, email, `socials[]` (`{platform, handle, url, icon}`), `resume` (`{label, path}` → `/public/resume.pdf`, single combined resume/CV).
- **Experience → `experience.ts`** typed array: `{ org, role, start, end | "present", location?, summary, highlights[], stack[], type: "work" | "education" | "hackathon" | "organization" }`. Rendered as a compact vertical timeline in the Experience section — monospace dates, hairline connector, same visual language as the Lab rows. **Content rule unchanged: only verifiable entries ship.** From the audit, verifiable candidates are: Encode Club UXMaxx Hackathon (Arbor, 3-person team, 7 days), university coursework/team projects (AILY, Nutrify-scale work), PKM company-profile build. Employment history: Unknown / Not found — entries must be supplied by Kiya, nothing will be invented.
- **Tradeoff accepted:** editing content requires a commit. For a solo engineer's portfolio that's a feature (versioned, reviewable) — a CMS would be the over-engineering this plan warns against.

### 8. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **No verifiable metrics anywhere** (biggest content risk) | Lead with architecture + decisions; explicit honest "Status" field per project; add a hackathon-context line for Arbor. Never fabricate. |
| Generic "full-stack dev" drift | Product Engineer positioning enforced in bio, pills, and case-study framing (problem-first, always). |
| Hero #4 (AILY) is weakest | Ship it compact; demote to Lab post-launch if it dilutes. Decision point at content-writing time. |
| Split-pane hurts mobile | Pattern fully collapses below 1024px to header + single column; test at 360px. |
| Over-animation | Motion budget: one entrance stagger, hover transitions, expansion springs. Nothing else. Reduced-motion path mandatory. |
| Command palette as gimmick | Scope-locked to navigation/copy/links (~10 commands). If it can't stay useful, cut it — site works fully without it. |
| Crypto-dashboard vibe from Arbor | Web3 framed as the thing users *never see*; no coin iconography; green accent stays interface-green, not token-green. |
| Indonesian-language READMEs vs. (presumably) English portfolio | Case studies written fresh in English; repos stay as-is. Confirm language preference at approval. |
| Empty-looking site (4 + ~9 items) | Density by design: lab rows are compact; sidebar always full; case studies deep rather than numerous. |
| Demo links may not exist | Arbor verified live (arbor-watch.vercel.app, 2026-07-24). Every other link verified before publish; "Repo only" is an acceptable, honest state. |
| Resume/CV buttons ship without files | Buttons render only when the PDF exists in `/public`; no dead downloads. Files must be provided before launch. |

---

### 9. Signature identity system — portrait + Interactive Glass Jug

*Added 2026-07-24 on request. Planning-level evaluation only; neither feature is implemented yet.*

#### 9.1 Personal portrait / photo

**Evaluation.** The portfolio's strongest content is the hero case studies; the visual system is a dark gallery with hairline borders and one green accent. A large, art-directed portrait would compete with the projects for the "brightest object on screen" role that the system deliberately reserves for work artifacts. But a portfolio with no face reads colder than Kiya's actual personality (the GitHub profile is warm, mascot-driven, storybook-toned). The portrait's job is *trust and warmth*, not spectacle.

**Recommendation:**

1. **Placement:** fixed sidebar, top of the identity block — above the name, so the reading order is face → name → title → bio. This makes the portrait part of the persistent identity rail rather than a content item, and it never scrolls away (identity always present, exactly what the split-pane exists for).
2. **Visual treatment:** **minimal-editorial.** A modest square-to-portrait crop (~96–120px on desktop), 1px `line` border, very slight corner radius (match pill radius), rendered in muted/monochrome-leaning tone so it sits inside the dark palette instead of fighting it. Optional: full color on hover — a small, quiet moment of warmth consistent with the "tactile" motion language. Candid-but-composed beats corporate headshot; art-directed drama is rejected as off-positioning for a Product Engineer.
3. **Prominence:** low-medium. Roughly the visual weight of the tech-pill cluster. Never larger than the first hero card's title block.
4. **Desktop behavior:** static, always visible in the sidebar. No parallax, no reveal animation beyond the single global entrance stagger.
5. **Mobile behavior:** collapses to a small avatar (~32px, rounded) in the sticky header, left of the name. The full portrait can optionally reappear once, larger (~160px), inside the About section — the natural "who is this person" moment on mobile where it doesn't fight the projects.
6. **Positioning support:** a real face beside the words "Product Engineer" converts an anonymous repo list into a person you could hire; the restrained treatment signals design judgment, which *is* the portfolio's implicit claim.
7. **Reserved placeholder:** sidebar identity block, slot rendered as `[PERSONAL PORTRAIT / PHOTO]` until the image is supplied (component renders nothing publicly until the file exists — same rule as the resume button; no broken-image state ships).

#### 9.2 Interactive Glass Jug / Comment Jar

**Concept:** translucent glass container; approved visitor comments float inside as cards; visitors can poke them and submit their own.

**Honest evaluation.**

- *Authenticity:* **strong fit.** Kiya's public identity (profile README: forest mascot, "quiet coding camp", "tiny tool gardener") is playful-but-tidy. A guestbook jar is exactly this personality. This is the rare case where a whimsical signature feature is *on-brand* rather than bolted on.
- *Memorability:* high. Almost no engineering portfolios have a genuinely interactive visitor artifact.
- *Strategic risk:* **real, and must be named.** Three problems:
  1. **Visual-system conflict.** The approved system explicitly bans glow/gradient decoration; full glassmorphism panels would be a second, contradictory visual language. Resolution: glass lives *only inside the jug* — one contained glass object in a matte world, which actually heightens the effect (a lit specimen in a dark gallery) instead of diluting it.
  2. **Architecture conflict.** The site is a zero-runtime static export. Visitor submissions + an approval queue require storage, an API, and moderation — the first piece of backend infrastructure in the whole project. Options at implementation time: GitHub Issues/Discussions as the store with manual approval (keeps the site static; jar reads a JSON built from approved entries at deploy), or a small KV/DB + serverless function (abandons pure static). Decision deferred; GitHub-backed is the default recommendation because approval = closing an issue, and the deploy pipeline stays trivial.
  3. **Attention budget.** If the jar sits early in the page it will out-charm the case studies. It must be a *reward at the end of the journey*, not a lobby attraction.

**Recommendation:**

1. **Placement:** dedicated section at the **end of the main scroll column, after Contact** — the final thing a visitor meets, when the work has already made its argument. Sidebar nav gains one last entry (e.g. "Jar"). Not in the sidebar, not near the top.
2. **Interaction model** *(clarified by Kiya, 2026-07-24 — the jug is a literal jug-shaped vessel, and dropping a message in is a physical gesture)*:
   - The jug renders as an actual jug silhouette (SVG-clipped glass body: neck, shoulder, belly, handle) — not a generic rounded panel. Approved notes sit *inside* the vessel as small folded-paper cards, settled in a pile with gentle physics; the glass clip means cards are visibly contained by the jug's walls.
   - **Reading:** hover/tap a card inside → it floats up out of the neck and unfolds to full size; dismiss → it drops back in and the pile resettles.
   - **Submitting is the signature gesture:** the visitor writes a note on a small card next to the jug, then **grabs it and drops it in through the jug's mouth** — drag on desktop, touch-drag on mobile, with the card tumbling down the neck and landing on the pile (spring physics, slight paper rotation). For accessibility and non-drag users, a plain "drop it in" button performs the same submission with the same drop animation. Submitted cards land visually but carry an "awaiting approval" tag until moderated — nothing appears publicly unapproved, and the visitor still gets the satisfying physical payoff immediately.
   - Rate-limited; moderation flow unchanged (§9.2 point 7 architecture options).
3. **Desktop behavior:** pointer interaction (nudge cards, spring settle — the same `stiffness ~300, damping ~30` tactile language as the rest of the site). Physics paused off-screen; `prefers-reduced-motion` gets a static stacked layout inside the jug outline.
4. **Mobile behavior:** jug silhouette kept (identity matters), physics simplified — cards shown as a settled pile without free-floating drift; tap to lift-and-read; submission via touch-drag *or* the "drop it in" button (button is the primary path on small screens). If performance demands, degrade to the framed-list fallback, still inside the jug outline.
5. **Visual-system relationship:** the *only* glass element on the site (backdrop-blur, 1px translucent border, faint inner highlight). Cards inside use `surface` styling with monospace names — the jar is special, its contents are ordinary, which keeps it refined.
6. **Relationship to portrait:** see 9.3 — sequential, not composed together.
7. **Launch timing:** **not in v1.** Ship heroes + lab + about + contact first; the jar is the first post-launch feature (v1.1). Reasons: it's the only feature needing infrastructure + moderation, and launching without content in the jar looks emptier than not having it. Seed plan: collect a handful of notes from friends/teammates before the section goes live.

#### 9.3 Relationship: Option C — sequential experience (recommended)

- **A (separate anchors)** is half right — they *are* separate elements — but treats them as unrelated, wasting the narrative link.
- **B (integrated composition)** is rejected: the portrait lives in the persistent sidebar, the jug is a scroll destination; forcing them into one composition either drags the jug into the sidebar (cramped, distracting on every screen) or pulls the portrait out of the identity rail (breaks the split-pane logic).
- **C (sequential)** matches the architecture already chosen: visitor meets the *person* in the first 3 seconds (portrait, sidebar), spends the visit with the *work* (heroes, lab), and ends with the *personality* (jar — leave a note for the person you just met). Opening and closing the visit with the human layer, work in the middle. On mobile the same order holds naturally: header avatar → content → jar at page end.

A single quiet link ties them: the jar section's heading can carry a small echo of the portrait or mascot — one line, e.g. "Enjoyed the visit? Leave a note in the jar." No further coupling.

#### 9.4 Strategic evaluation (explicit answers)

- **Does the portrait strengthen the portfolio?** Yes — at small size. It converts an anonymous project list into a hireable person at near-zero attention cost. Include in v1 (slot ships now, image whenever ready).
- **Does the Glass Jug strengthen the portfolio?** Yes, *conditionally*: end-of-page placement, contained glass treatment, moderated content, post-launch timing. Outside those conditions it's a gimmick.
- **Together or separately?** Separately placed, sequentially experienced (Option C). Never one composition.
- **Visually impressive but strategically distracting?** The jug — partially, yes, stated plainly: as a top-of-page or sidebar feature it would out-charm the case studies and damage the content-first thesis. The mitigation *is* the placement and timing above, not a redesign of the feature.
- **Simplest version preserving the core idea:** a **guestbook wall** — same end-of-page section, same glass-framed container, approved notes as a static card grid (no physics), same submit form. Ships with ~30% of the effort, keeps the personal-interactive soul, and can be upgraded to the full floating jar later without moving anything. If v1.1 effort is constrained, build this first.

---

## PHASE 3 — APPROVAL CHECKPOINT

This plan awaits your decision: **YES** (proceed to implementation) / **NO** / **MODIFY** (state changes).

Open questions to resolve at approval (defaults in parentheses):
1. Display name on the site — full name or "Kiya"? (default: Kiya + full name in about)
2. Site language (default: English)
3. AILY as hero #4 or Lab? (default: hero, compact)

Materials Kiya will supply later (confirmed 2026-07-24 — site builds fine without them; button/icons appear when supplied):
- `resume.pdf` — one combined resume/CV document (single `Resume ↓` button)
- Social media handles/URLs (LinkedIn, X/Twitter, Instagram, Telegram, etc.) — only GitHub and email verified so far; nothing will be invented or placeholder-linked
- Portrait photo — minimal-editorial, candid-but-composed (see §9.1); slot ships hidden until supplied
- Experience entries — roles/orgs/dates for the Experience timeline (only Kiya can supply employment history; hackathon + education entries can be drafted from the audit for confirmation)
- (later, for Glass Jug v1.1) seed guestbook notes from friends/teammates before the section goes live
