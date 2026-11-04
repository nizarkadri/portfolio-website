// app/lib/blog-shared.ts — pure types + zod schema, safe for client+server.
import { z } from 'zod';

export const blogFrontmatterSchema = z.object({
  title: z.string().min(3).max(200),
  date: z.coerce.date(),
  slug: z.string().min(1).max(120).optional(),
  excerpt: z.string().min(20).max(400),
  tags: z.array(z.string().min(1).max(40)).default([]),
  coverImage: z.string().optional(),
  author: z.string().max(120).default('Nizar Kadri'),
  readingTime: z.number().int().min(1).optional(),
  featured: z.boolean().default(false),
});
export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

export interface BlogPostSummary {
  slug: string; title: string; excerpt: string; date: string; tags: string[];
  coverImage?: string; author: string; readingTime: number; featured: boolean; wordCount: number;
}
export interface BlogNode { type: string; value?: string; children?: BlogNode[]; depth?: number; url?: string; alt?: string; ordered?: boolean; lang?: string; align?: string[]; }
export interface BlogPost extends BlogPostSummary { contentAst: BlogNode; }

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
export const newPostSchema = blogFrontmatterSchema.extend({
  title: z.string().min(3).max(200),
  excerpt: z.string().min(20).max(400),
  content: z.string().min(200, 'Write at least ~200 characters of markdown'),
});
export type NewPostInput = z.infer<typeof newPostSchema>;
