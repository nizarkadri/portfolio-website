import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { BlogPostSummary } from '../app/lib/blog-shared';
import { formatBlogDate, formatBlogDateShort } from '../app/lib/blog-shared';
import { Arrow } from './Navbar';

export function BlogTags({ tags, max = 3 }: { tags: string[]; max?: number }) {
  if (!tags.length) return null;
  return (
    <ul className="bc-tags" aria-label="Topics">
      {tags.slice(0, max).map((t) => (
        <li key={t} className="lg-chip">{t}</li>
      ))}
    </ul>
  );
}

/** One line of the ledger: date, title and excerpt, reading time and topics. */
export function BlogRow({ post, heading = 'h2', index = 0 }: { post: BlogPostSummary; heading?: 'h2' | 'h3'; index?: number }) {
  const Heading = heading;
  return (
    <li className="bl-row bc-rise" style={{ '--i': Math.min(index, 6) } as CSSProperties}>
      <p className="bl-row__date lg-note">
        <time dateTime={post.date}>{formatBlogDateShort(post.date)}</time>
      </p>
      <div className="bl-row__main">
        <Heading className="bl-row__title lg-display lg-display--sm">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </Heading>
        <p className="lg-body">{post.excerpt}</p>
      </div>
      <div className="bl-row__meta">
        <p className="lg-note">{post.readingTime} min read</p>
        <BlogTags tags={post.tags} />
      </div>
    </li>
  );
}

/** Kept under its old name for callers that still import it. Render inside a `.bl-ledger` list. */
export const BlogCard = BlogRow;

/** The featured entry: the same information as a row, set at the size of a lead story. */
export function BlogHero({ post }: { post: BlogPostSummary }) {
  return (
    <article className="bl-feature bc-rise">
      <p className="lg-note">
        <b>Featured</b> · <time dateTime={post.date}>{formatBlogDate(post.date)}</time> · {post.readingTime} min read
      </p>
      <h2 className="bl-feature__title lg-display">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <div className="bl-feature__foot">
        <p className="lg-body lg-body--lg">{post.excerpt}</p>
        <div className="bl-feature__side">
          <BlogTags tags={post.tags} max={5} />
          <span className="bl-more" aria-hidden="true">Read the post <Arrow /></span>
        </div>
      </div>
    </article>
  );
}
