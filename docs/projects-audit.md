# Projects Audit — Resume KB §4 vs Website `data/projects/`

**Date:** 2026-11-04 · **Branch:** `redesign/projects-and-blog` (do not switch) · **Source:** `/home/nkdev/ResumePlanning/RESUME_KNOWLEDGE_BASE.md` (§4.1–§4.16, §3.2, §8.3, §12, §11) · **Website (before):** 3 files (`ev-gpt.md`, `skin-disease-detection.md`, `portfolio-website.md`) · **Website (after):** 14 files.

## Comparison table

| KB section | Resume project | Website (before) | Status | Priority | Metrics / tech to keep | Action |
|---|---|---|---|---|---|---|
| §4.1 | AI-Powered Skin Disease Detection | `skin-disease-detection.md` | **Exists** | — | 92% accuracy, 20+ diseases, 1,000+ labeled images (Microsoft Custom Vision, Node/Express/EJS/MongoDB) | Verified — metrics exact vs §8.3. **Date note:** website `year: '2024'` vs KB old-variant Mar–Apr 2020 (Windsor, before MAppComp Sep 2020 — §11 flags likely 2021–22). Left as-is; do not claim 2020 without reconciliation. |
| §4.2 | EV-GPT | `ev-gpt.md` | **Exists** | — | Google Gemini 1.5 Flash, ChromaDB, LangChain, Streamlit, Python/Docker/AWS, IP `18.117.102.197:8501` | Verified — matches §4.2 exactly. |
| §4.3 | Distributed Student Networking App | — | **Missing → Added** | HIGH | Node, Express, IBM Db2, REST + GraphQL, video/chat/events; KB dates Nov–Dec 2020 (Windsor) | Created `distributed-student-networking.md`, `year: '2020'`, status Archived. |
| §4.4 | Portfolio Website | `portfolio-website.md` | **Exists** | — | Next.js, TypeScript, Tailwind, Framer Motion, Markdown, Vercel; 2026 variants add Three.js + CI/CD on GCP | Verified — matches §4.4. |
| §4.5 (§3.2) | Screenshot-to-Color-Palette / UI Palette Explorer (colorBrain) | — | **Missing → Added** | HIGH | GCP Cloud Run API+worker, Cloud Tasks, Firestore, sandboxed Chromium, Kanban role panel, Space-cycle, CSS vars/JSON export, hundreds of palettes; matching metric: 50+ colors (Condo), 80% context guard | Created `ui-palette-explorer.md`, featured, order 4, year 2024. |
| §4.6 (§3.2) | CondoConnect — Flutter condo community app | — | **Missing → Added** | HIGH | Community feed, marketplace, DMs, issue reporting, polls, Sentry, Supabase RLS, Material3 **50+ colors**, Maestro | Created `condoconnect.md`, featured, order 5, year 2025. Repo path verified `/mnt/d/learning_/CondoLife/Flutter-CondoApp/flutter/`. |
| §4.7 (§3.2) | AI-Assisted Dev Workflow & MCP Tooling (Pi Owl, Flutter MCP, Pi PR #5155) | — | **Missing → Added** | HIGH | OpenRouter, Pi, task queue, Pi PR #5155 (grapheme width, issue #5157), 80% context guard, Flutter MCP (lifecycle/emulator/hot-reload/analyze) | Created `ai-assisted-dev-workflow.md`, order 8, year 2025, not featured (tooling page). |
| §4.8 (§3.2) | IRCC Genie — RAG immigration assistant | — | **Missing → Added** | HIGH | Python, Scrapy, ChromaDB, HF embeddings, Gemini (gemini-pro, temp 0.3), pytest, FSW 6 factors | Created `ircc-genie.md`, order 6, year 2024. Repos verified `/mnt/d/learning_/IRCC_genie/IRCC_Genie/` + `ScraPPy-RAG-IRCC/ircc_crawler/`. |
| §4.9 | Local Generative Model Deployment & Fine-Tuning | — | **Missing → Added** | MEDIUM | HF, ComfyUI, Stable Diffusion, StyleGAN3, CUDA/xFormers, PhotoMaker V2/Kohya | Created `local-generative-models.md`, order 9, status Archived. Note: KB §3.6 AMD variant discarded, but §4.9 is standalone validated — included without AMD claims. |
| §4.10 | FMCG Analysis Application (old-variant only) | — | **Missing → Added (archived)** | LOW | IBM Cognos ("Cognoze"), Android POS, Python, IBM Db2, Ganpat+IBM Nov 2019–Feb 2020 | Created `fmcg-analysis.md`, order 13, status Archived. Optional per brief; included. |
| §4.11 | Automated Login & Password Reset (old-variant only) | — | **Missing → Added (archived)** | LOW | Python scraping, IBM Watson CAPTCHA, Gmail API OTP, Aug–Sep 2019 | Created `automated-login.md`, order 14, status Archived. Optional per brief; included. |
| §4.12 | ~~Energy Market Data Analyzer~~ (NexusEnergy) | — | **DISCARDED** | — | — | **DO NOT ADD** — §12 discarded item 9. Skipped intentionally. |
| §4.13 | ~~Real-Time Analytics Platform Migration~~ (ClickHouse) | — | **DISCARDED** | — | — | **DO NOT ADD** — DataEngineer variant, §12 discarded. Skipped intentionally. |
| §4.14 | WordPress Plugin Development | — (in `data/experience/cgi.md`) | **Exists (as experience)** | — | Engagement +35%, page load −25% (CGI/SEDAR) | No standalone project file. Already represented in experience achievements; not duplicated. |
| §4.15 | Side projects: MatchCards, insta-feed, microservices-project, react-job-api, gemini-form-auto-filler | — | **Missing → Added** | MEDIUM | MatchCards Jest/Testing Library; insta-feed MongoDB/Multer/GridFS/react-h5-audio-player; microservices docker-compose/nginx/AppDynamics; react-job-api Express+uuid+Vite/Tailwind; gemini-form-auto-filler Chrome ext + @google/genai | Created 3 files: `insta-feed.md` (order 10), `microservices-project.md` (order 11), `learning-projects-collection.md` (order 12, covers MatchCards + react-job-api + gemini-form-auto-filler). `/mnt/d/learning_/` verified accessible. TradeView/ChromeExt/EventManagement/TimeTable/Vue/C++/UofT/DockerLinkedIn/screenshottocode/AutoJob/AutoJObsBackend not given standalone pages (coursework/practice or empty dirs per KB — see §4.15). |
| §4.16 | Resume-tailoring automation (PromptTemplate.ts) | — | **Not a public project** | — | LaTeX JD-tailoring system prompt | Not added to website projects (internal tooling, no repo/published state). Skipped intentionally; document only. |

## DISCARDED warnings (§12 — never add)

- **§4.12 Energy Market Data Analyzer / NexusEnergy** — DISCARDED variant content. Do not add.
- **§4.13 Real-Time Analytics Platform Migration (PostgreSQL→ClickHouse, 50TB, 100x)** — DISCARDED (DataEngineer). Do not add.
- **§3.6 AMD video/DirectX, §3.7 DataEngineer ClickHouse extras** — DISCARDED. Not added.
- **Instacart, HSBC, Snowflake, Trade Desk/RBC extras, .NetDeveloper extras** — DISCARDED per §12 items 1–9. If these appear in older debts, exclude. No such files created.
- **§4.10 FMCG & §4.11 Automated Login** are NOT discarded (old-variant only) — included as `status: Archived` low-priority pages, not featured.

## CGI date check (brief item)

- `data/experience/cgi.md` currently has **no date field at all** (frontmatter: title/company/position/location/description/achievements/technologies only) — nothing to fix to "Feb 2024" in that file.
- `components/Experience.tsx:43` still has a commented-out `{/* <p ...>Jun 2022 - Dec 2024</p> */}` — stale comment only, not rendered, out of scope for this task (projects branch). **Recommend parent agent fix or remove the comment** since KB confirms CGI end = **Feb 2024** (§12.1, §11). Not changed here to stay in scope (`data/projects/*` only + audit).
- No other `Dec 2024` references in `data/` besides that comment.

## Files created (11 new `data/projects/*.md`)

1. `ui-palette-explorer.md` — featured, order 4, year 2024
2. `condoconnect.md` — featured, order 5, year 2025
3. `ircc-genie.md` — order 6, year 2024
4. `distributed-student-networking.md` — order 7, year 2020, Archived
5. `ai-assisted-dev-workflow.md` — order 8, year 2025 (tooling)
6. `local-generative-models.md` — order 9, year 2024, Archived
7. `insta-feed.md` — order 10, year 2023, Archived
8. `microservices-project.md` — order 11, year 2023, Archived
9. `learning-projects-collection.md` — order 12, year 2023, Archived
10. `fmcg-analysis.md` — order 13, year 2019, Archived
11. `automated-login.md` — order 14, year 2019, Archived

**Skipped + reason:** §4.12, §4.13 (DISCARDED), §4.14 (already experience), §4.16 (internal, not public), §4.15 remainder (TradeView, ChromeExt, coursework/practice, empty AutoJob dirs — no standalone pages per KB evidence).

**Contract:** No changes to `app/lib/projects.ts` / `app/lib/project-shared.ts` needed — all new files use the existing frontmatter schema (`title, description, summary, imageUrl, slug, technologies, featured, order, repoUrl, liveUrl?, year, status, impact, highlights`). `imageUrl` points to `/images/Projects/<slug>.jpg` and falls back to `/images/Projects/project-placeholder.svg` (exists) via `resolveProjectImage`. Only 2 files are `featured: true` (palette + CondoConnect) plus the 3 pre-existing featured files.
