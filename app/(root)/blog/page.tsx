import type { Metadata } from 'next';
import { getAllPosts, getAllTags, getFeaturedPost } from '../../lib/blog';
import BlogListClient from '../../../components/BlogListClient';
import '../../blog-contact.css';

export const metadata: Metadata = {
  title: 'Blog: Engineering Notes',
  description: 'Engineering notes on AI agents, distributed systems, RAG, and mobile testing.',
  openGraph: { title: 'Blog: Engineering Notes', description: 'Engineering notes on AI agents, distributed systems, RAG, and mobile testing.', type: 'website' },
};

export default async function BlogPage() {
  const [posts, tags, featured] = await Promise.all([getAllPosts(), getAllTags(), getFeaturedPost()]);
  return (
    <div className="lg-page bl tone-day tone-ground">
      <div className="lg-wrap">
        <header className="bl-head bc-rise">
          <h1 className="lg-display lg-display--xl">Engineering notes</h1>
          <p className="lg-body lg-body--lg">
            Field notes from production systems: what worked, what broke, and what I would do again.
          </p>
        </header>
        {/* The site footer carries the closing ask, so the index ends on its last entry. */}
        <BlogListClient posts={posts} tags={tags} featured={featured} />
      </div>
    </div>
  );
}
