import Link from 'next/link';
import type { BlogPostSummary } from '../app/lib/blog-shared';
import { BlogCard } from './BlogCard';

export default function BlogPreview({ posts }: { posts: BlogPostSummary[] }) {
  if (!posts.length) return null;
  return (
    <section aria-label="Latest blog posts" className="container mx-auto max-w-6xl px-4 py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#D9FF4B]">Blog</p>
          <h2 className="mt-2 text-4xl font-bold text-white md:text-5xl">Latest writing</h2>
        </div>
        <Link href="/blog" className="rounded-full border border-[#B8E62D]/40 px-5 py-2.5 text-sm font-semibold text-[#D9FF4B] transition-colors hover:bg-[#B8E62D]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">All posts →</Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">{posts.map((p) => <BlogCard key={p.slug} post={p} />)}</div>
    </section>
  );
}
