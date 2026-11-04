"use client";
import { useMemo, useState } from 'react';
import type { BlogPostSummary } from '../app/lib/blog-shared';
import { BlogCard } from './BlogCard';

export default function BlogListClient({ posts, tags }: { posts: BlogPostSummary[]; tags: string[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => posts.filter((p) =>
    (!active || p.tags.includes(active)) &&
    (!query || `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))), [posts, active, query]);
  const pill = (t: string | null, label: string) => (
    <button key={label} onClick={() => setActive(t)} aria-pressed={active === t}
      className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] ${active === t ? 'border-[#B8E62D] bg-[#B8E62D] font-semibold text-black' : 'border-white/15 text-white/70 hover:border-[#B8E62D]/50'}`}>{label}</button>
  );
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <label className="sr-only" htmlFor="blog-search">Search posts</label>
        <input id="blog-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts…"
          className="w-full max-w-md rounded-full border border-white/15 bg-[#0B0B0F] px-5 py-3 text-white placeholder:text-white/40 focus:border-[#B8E62D] focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/40" />
        <div className="flex flex-wrap gap-2">{pill(null, 'All')}{tags.map((t) => pill(t, t))}</div>
      </div>
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-soft-white/60">No posts match. Try a different search or tag.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((p) => <BlogCard key={p.slug} post={p} />)}</div>
      )}
    </div>
  );
}
