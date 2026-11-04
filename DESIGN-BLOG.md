# Blog — Design & Authoring

## Architecture

- Reads: file-based Markdown in `data/blog/*.md`, parsed at build time by `app/lib/blog.ts`
  (`gray-matter` + `remark` mdast parsed to React elements in `components/BlogArticle.tsx` —
  no `dangerouslySetInnerHTML`). Works on Node serverless (Vercel / `next start`).
- Routes: `/blog`, `/blog/[slug]`, `/blog/new`.
- SEO: per-post metadata + `BlogPosting` JSON-LD (Next `Script` children, no raw HTML injection),
  sitemap includes `/blog` and every slug (from frontmatter `date`).

## Adding a post (recommended path)

1. Go to `/blog/new` (or copy a file in `data/blog/`).
2. Write Markdown with frontmatter:

```md
---
title: "My post title"
date: 2025-11-04
slug: my-post-title
excerpt: "One or two sentences shown in cards and SEO."
tags: ['AI Agents', 'Engineering']
author: Nizar Kadri
readingTime: 6
featured: false
---

Body in plain Markdown…
```

3. In the editor: **Copy Markdown** or **Download .md**.
4. **Download and commit `data/blog/<slug>.md` to publish.** (Next build picks it up automatically;
   no rebuild config needed — `getAllPostSlugs()` scans the directory.)

## Why no server write (POST /api/blog)

Node serverless functions can write to `/tmp`, but it is **ephemeral** — writes vanish on the next
cold start and are not shared between instances. A public unauthenticated `POST /api/blog` that
`fs.writeFile`s into `data/blog/` would also be a security hole on a public portfolio and would
never persist. So writes are client-side only (editor + download + git commit).

Commented-out optional example (dev-only, do NOT wire as live mutation):

```ts
// app/api/blog/route.ts — OPTIONAL dev-only sketch. Never deploy like this:
// writes land in ephemeral /tmp and are lost on cold start; no auth.
// import { writeFile } from 'node:fs/promises';
// export async function POST(req: Request) {
//   const { slug, markdown } = await req.json();
//   await writeFile(`/tmp/blog-${slug}.md`, markdown);
//   return Response.json({ ok: true }); // gone on next cold start — use git instead
// }
```
