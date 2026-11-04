# Projects Redesign — Design Notes (agent2)

Branch: `redesign/projects-and-blog` · Owner: agent2 (subordinate helper; parent agent1 owns orchestration)

## Research
Patterns reviewed (web, from training + current portfolio patterns): Linear (dark, hairline borders, restrained lime/emerald accent, feature-first hero), Vercel showcase (minimal cards, generous whitespace, single CTA), Raycast (bento cells, dense but legible micro-badges), shadcn bento (neutral zinc pills, consistent radius), and the existing repo's dark zinc + lime `#B8E62D` system. Linear/Vercel/Raycast all share: one accent color, neutral 90% UI, scannable badges, image-first cards, keyboard-focus-visible states.

## Decisions
- **Keep lime `#B8E62D` / `#D9FF4B` as the only accent.** No new palette; added semantics via opacity, not new hues. Matches existing globals/tokens.
- **Badges: neutral, not rainbow.** Old `ProjectBadges` cycled 7 bright colors by index (grew noisy as agent3 adds projects, low contrast). Now: white/10 pills + lime only for Featured/live. Added `ProjectFeaturedBadge`, `max`/`+N more` overflow on tech lists.
- **Cards: 3 variants** (was one split card, repeated): `showcase` (homepage first item / featured), `grid` (uniform grid), `compact` (bento cell). Same data contract — new `.md` projects render automatically. Stretched-link title (one tab stop per card), `aria-label` on image link, `alt=""` for decorative card images (title carries semantics).
- **Homepage (`Projects.tsx`):** first project = showcase, rest = 2-col grid, cap 6, dual CTAs (header + footer, both focus-visible). Section has `aria-labelledby`.
- **Projects page (`ProjectsClient.tsx`, now client):** search (multi-word AND over title/desc/summary/tech/status/impact), tech chip filters with counts + `aria-pressed`, sort (featured/year/title), grid↔bento toggle, featured section split out, `aria-live` result count, empty state with clear-filters. All keyboard-operable, visible focus rings.
- **Detail page (`[slug]/page.tsx`):** hero (16:8), metrics grid (impact/year/status/stack), prose + sticky highlights rail, breadcrumb, prev/next (wraps), and `generateMetadata` (was missing — list page metadata preserved untouched).
- **Links:** external `rel="noreferrer noopener"`, “(opens in new tab)” aria-labels, icons.
- **Responsive:** `sm/md/lg` breakpoints; `min-h` for image areas prevents CLS.

## Non-goals / handoff
- No blog changes, none `data/projects/*.md` touched. Photos reuse `app/lib/projects.ts` placeholder logic; no new images needed.
- Data contract unchanged (`ProjectSummary`). agent3's new projects need zero code changes — they appear in search/filters/sort/featured automatically.
- `getFeaturedProjectsData(3)` on homepage still drives the preview; the components cap at 6 defensively if the limit rises.

## Verification
- `npm run build` + `npm run lint` — see report below (run at end of session).
