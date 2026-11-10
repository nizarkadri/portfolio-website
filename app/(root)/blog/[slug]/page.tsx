import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostSlugs, getPostBySlug, getPrevNext, getRelatedPosts } from '../../../lib/blog';
import { formatBlogDate } from '../../../lib/blog-shared';
import { BlogRow, BlogTags } from '../../../../components/BlogCard';
import BlogArticle from '../../../../components/BlogArticle';
import BlogProgress from '../../../../components/BlogProgress';
import Script from 'next/script';
import BlogShare from '../../../../components/BlogShare';
import { Arrow } from '../../../../components/Navbar';
import '../../../blog-contact.css';

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

const PROSE_ID = 'post-body';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post;
  try { post = await getPostBySlug(slug); } catch { notFound(); }
  const [related, { prev, next }] = await Promise.all([getRelatedPosts(slug), getPrevNext(slug)]);
  const url = `https://nizarsway.com/blog/${slug}`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt,
    datePublished: post.date, author: { '@type': 'Person', name: post.author }, url, mainEntityOfPage: url };
  const facts = [
    { label: 'Published', value: <time dateTime={post.date}>{formatBlogDate(post.date)}</time> },
    { label: 'Reading time', value: `${post.readingTime} min` },
    { label: 'Length', value: `${post.wordCount.toLocaleString('en-US')} words` },
    { label: 'Written by', value: post.author },
  ];
  // Previous and next already have their own links; "keep reading" lists what is left.
  const beside = new Set([prev?.slug, next?.slug]);
  const more = related.filter((p) => !beside.has(p.slug));

  return (
    <div className="lg-page bl tone-day tone-ground">
      <BlogProgress target={PROSE_ID} />
      <Script id="blogposting-jsonld" type="application/ld+json" strategy="beforeInteractive">{JSON.stringify(jsonLd)}</Script>
      <article className="lg-wrap">
        <header className="bl-post__head bc-rise">
          <nav aria-label="Breadcrumb">
            <Link href="/blog" className="bl-back lg-note"><Arrow /> All notes</Link>
          </nav>
          <h1 className="bl-post__title lg-display">{post.title}</h1>
          <p className="lg-body lg-body--lg">{post.excerpt}</p>
        </header>

        <div className="bl-post__grid">
          <aside className="bl-post__aside" aria-label="About this note">
            <dl className="bl-facts">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <BlogTags tags={post.tags} max={6} />
            <BlogShare title={post.title} url={url} />
          </aside>
          <BlogArticle ast={post.contentAst} id={PROSE_ID} />
        </div>

        {(prev || next) && (
          <nav aria-label="More notes" className="bl-pn">
            {prev && (
              <Link href={`/blog/${prev.slug}`} className="bl-pn__prev">
                <span className="lg-note"><Arrow /> Previous note</span>
                <span className="lg-display lg-display--sm">{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link href={`/blog/${next.slug}`} className="bl-pn__next">
                <span className="lg-note">Next note <Arrow /></span>
                <span className="lg-display lg-display--sm">{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      {more.length > 0 && (
        <section aria-labelledby="keep-reading" className="lg-wrap bl-related">
          <h2 id="keep-reading" className="lg-display lg-display--md">Keep reading</h2>
          <ol className="bl-ledger">
            {more.map((p, i) => <BlogRow key={p.slug} post={p} heading="h3" index={i} />)}
          </ol>
        </section>
      )}
    </div>
  );
}
