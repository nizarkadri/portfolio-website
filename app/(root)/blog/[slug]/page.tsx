import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostSlugs, getPostBySlug, getPrevNext, getRelatedPosts } from '../../../lib/blog';
import { formatBlogDate } from '../../../lib/blog-shared';
import { BlogCard, BlogTags } from '../../../../components/BlogCard';
import BlogArticle from '../../../../components/BlogArticle';
import Script from 'next/script';
import BlogShare from '../../../../components/BlogShare';

export async function generateStaticParams() { return getAllPostSlugs(); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await getPostBySlug(slug);
    return { title: p.title, description: p.excerpt, keywords: p.tags,
      openGraph: { title: p.title, description: p.excerpt, type: 'article', publishedTime: p.date, authors: [p.author], tags: p.tags, images: p.coverImage ? [p.coverImage] : undefined },
      twitter: { card: 'summary_large_image', title: p.title, description: p.excerpt } };
  } catch { return { title: 'Post not found' }; }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post;
  try { post = await getPostBySlug(slug); } catch { notFound(); }
  const [related, { prev, next }] = await Promise.all([getRelatedPosts(slug), getPrevNext(slug)]);
  const url = `https://nizarsway.com/blog/${slug}`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt,
    datePublished: post.date, author: { '@type': 'Person', name: post.author }, url, mainEntityOfPage: url };
  const stats = [
    { label: 'Reading time', value: `${post.readingTime} min` },
    { label: 'Words', value: post.wordCount.toLocaleString() },
    { label: 'Published', value: formatBlogDate(post.date) },
    { label: 'Tags', value: String(post.tags.length) },
  ];
  const navLink = (p: typeof prev, label: string, align: string) => p ? (
    <Link href={`/blog/${p.slug}`} className={`group rounded-2xl border border-white/10 bg-[#0B0B0F]/95 p-5 transition-colors hover:border-[#B8E62D]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] ${align}`}>
      <span className="block text-xs uppercase tracking-[0.2em] text-soft-white/50">{label}</span>
      <span className="mt-1 block font-semibold text-white group-hover:text-[#D9FF4B]">{p.title}</span>
    </Link>) : <span />;
  return (
    <div className="min-h-screen py-20">
      <Script id="blogposting-jsonld" type="application/ld+json" strategy="beforeInteractive">{JSON.stringify(jsonLd)}</Script>
      <article className="container mx-auto max-w-3xl px-4">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-soft-white/50">
          <Link href="/" className="rounded hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">Home</Link><span aria-hidden>/</span>
          <Link href="/blog" className="rounded hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">Blog</Link><span aria-hidden>/</span>
          <span aria-current="page" className="text-white">{post.title}</span>
        </nav>
        <header>
          <BlogTags tags={post.tags} max={6} />
          <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-8 text-soft-white/70">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-soft-white/50">
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time><span aria-hidden>·</span><span>{post.author}</span><span aria-hidden>·</span><span>{post.readingTime} min read</span>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-[#0B0B0F]/95 p-4">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-soft-white/50">{s.label}</dt>
                <dd className="mt-1 font-semibold text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6"><BlogShare title={post.title} url={url} /></div>
        </header>
        <BlogArticle ast={post.contentAst} />
        <nav aria-label="More posts" className="mt-14 grid gap-4 md:grid-cols-2">
          {navLink(prev, '← Newer post', '')}{navLink(next, 'Older post →', 'md:text-right')}
        </nav>
      </article>
      {related.length > 0 && (
        <section aria-label="Related posts" className="container mx-auto mt-20 max-w-6xl px-4">
          <h2 className="mb-8 text-3xl font-bold text-white">Related posts</h2>
          <div className="grid gap-6 md:grid-cols-3">{related.map((p) => <BlogCard key={p.slug} post={p} />)}</div>
        </section>
      )}
    </div>
  );
}
