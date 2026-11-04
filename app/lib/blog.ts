'use server';
// File-based blog reads (serverless-safe: baked in at build time, like projects.ts).
import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import matter from 'gray-matter';
import { remark } from 'remark';
import { BlogNode, BlogPost, BlogPostSummary, estimateReadingTime } from './blog-shared';

const dir = path.join(process.cwd(), 'data/blog');
const fileNames = () => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : []);

function toSummary(slug: string, data: Record<string, unknown>, content: string): BlogPostSummary {
  const date = data.date instanceof Date ? data.date.toISOString() : String(data.date ?? new Date().toISOString());
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return {
    slug: String(data.slug ?? slug),
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? ''),
    date,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    author: String(data.author ?? 'Nizar Kadri'),
    readingTime: typeof data.readingTime === 'number' ? data.readingTime : estimateReadingTime(content),
    featured: Boolean(data.featured),
    wordCount,
  };
}
const read = (f: string) => { const raw = fs.readFileSync(path.join(dir, f), 'utf8'); const m = matter(raw); return { slug: f.replace(/\.md$/, ''), data: m.data as Record<string, unknown>, content: m.content }; };

const getAll = cache(async (): Promise<BlogPostSummary[]> =>
  fileNames().map((f) => { const r = read(f); return toSummary(r.slug, r.data, r.content); })
    .sort((a, b) => Number(b.featured) - Number(a.featured) || +new Date(b.date) - +new Date(a.date)));

export async function getAllPosts(): Promise<BlogPostSummary[]> { return getAll(); }
export async function getFeaturedPost(): Promise<BlogPostSummary | null> { const a = await getAll(); return a.find((p) => p.featured) ?? a[0] ?? null; }
export async function getAllTags(): Promise<string[]> { return [...new Set((await getAll()).flatMap((p) => p.tags))].sort(); }
export async function getPostsByTag(tag: string): Promise<BlogPostSummary[]> { return (await getAll()).filter((p) => p.tags.includes(tag)); }
export async function getAllPostSlugs() { return fileNames().map((f) => ({ slug: f.replace(/\.md$/, '') })); }

const getOne = cache(async (slug: string): Promise<BlogPost> => {
  const r = read(`${slug}.md`);
  // SAFETY: remark().parse returns mdast Root; BlogNode is a structural subset (type/value/children…) that BlogArticle only reads. mdast is plain JSON data from author-controlled files, so the subset cast is sound.
  const ast = remark().parse(r.content) as unknown as BlogNode;
  return { ...toSummary(r.slug, r.data, r.content), contentAst: ast };
});
export async function getPostBySlug(slug: string): Promise<BlogPost> {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Invalid slug');
  return getOne(slug);
}
export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPostSummary[]> {
  const all = await getAll(); const cur = all.find((p) => p.slug === slug); if (!cur) return all.slice(0, limit);
  const scored = all.filter((p) => p.slug !== slug).map((p) => ({ p, score: p.tags.filter((t) => cur.tags.includes(t)).length }));
  return scored.sort((a, b) => b.score - a.score || +new Date(b.p.date) - +new Date(a.p.date)).slice(0, limit).map((s) => s.p);
}
export async function getPrevNext(slug: string) {
  const all = await getAll(); const i = all.findIndex((p) => p.slug === slug);
  return { prev: i > 0 ? all[i - 1] : null, next: i >= 0 && i < all.length - 1 ? all[i + 1] : null };
}
