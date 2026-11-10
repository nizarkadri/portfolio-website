import Link from 'next/link';
import type { BlogPostSummary } from '../app/lib/blog-shared';
import { BlogRow } from './BlogCard';
import '../app/blog-contact.css';

export default function BlogPreview({ posts }: { posts: BlogPostSummary[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="latest-writing" className="lg-wrap lg-section bl-related">
      <h2 id="latest-writing" className="lg-display lg-display--md">Latest writing</h2>
      <ol className="bl-ledger">{posts.map((p, i) => <BlogRow key={p.slug} post={p} heading="h3" index={i} />)}</ol>
      <p style={{ margin: '1.5rem 0 0' }}><Link href="/blog" className="lg-link">All notes</Link></p>
    </section>
  );
}
