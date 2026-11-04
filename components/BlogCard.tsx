import Link from 'next/link';
import type { BlogPostSummary } from '../app/lib/blog-shared';
import { formatBlogDate } from '../app/lib/blog-shared';

export const LIME = '#B8E62D';
const card = 'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0F]/95 transition-colors duration-300 hover:border-[#B8E62D]/35 hover:bg-[#0D0D12]';

export function BlogTags({ tags, max = 3 }: { tags: string[]; max?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, max).map((t) => (
        <span key={t} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-soft-white/60">{t}</span>
      ))}
    </div>
  );
}

export function BlogCard({ post, featured = false }: { post: BlogPostSummary; featured?: boolean }) {
  return (
    <article className={card}>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-soft-white/50">
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time><span aria-hidden>·</span><span>{post.readingTime} min read</span>
          {featured && <span className="ml-auto rounded-full bg-[#B8E62D] px-2 py-0.5 font-bold normal-case tracking-normal text-black">Featured</span>}
        </div>
        <h3 className="text-xl font-semibold leading-tight text-white">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] transition-colors hover:text-[#D9FF4B]">{post.title}</Link>
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 leading-7 text-soft-white/65">{post.excerpt}</p>
        <div className="relative z-10 mt-5"><BlogTags tags={post.tags} /></div>
      </div>
    </article>
  );
}

export function BlogHero({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[#B8E62D]/25 bg-[#0B0B0F]/95 p-8 md:p-12">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#D9FF4B]">Featured post</p>
      <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl">
        <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-[#D9FF4B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] rounded">{post.title}</Link>
      </h2>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-soft-white/70">{post.excerpt}</p>
      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-soft-white/50">
        <time dateTime={post.date}>{formatBlogDate(post.date)}</time><span aria-hidden>·</span><span>{post.readingTime} min read</span><span aria-hidden>·</span><span>{post.author}</span>
      </div>
      <div className="mt-6"><BlogTags tags={post.tags} max={5} /></div>
      <Link href={`/blog/${post.slug}`} className="mt-8 inline-block rounded-full bg-[#B8E62D] px-6 py-3 font-semibold text-black transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Read the post →</Link>
    </article>
  );
}
