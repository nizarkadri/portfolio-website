import type { Metadata } from 'next';
import { getAllPosts, getAllTags, getFeaturedPost } from '../../lib/blog';
import { BlogHero } from '../../../components/BlogCard';
import BlogListClient from '../../../components/BlogListClient';
import BlogNewsletter from '../../../components/BlogNewsletter';

export const metadata: Metadata = {
  title: 'Blog — Engineering Notes',
  description: 'Engineering notes on AI agents, distributed systems, RAG, and mobile testing.',
  openGraph: { title: 'Blog — Engineering Notes', description: 'Engineering notes on AI agents, distributed systems, RAG, and mobile testing.', type: 'website' },
};

export default async function BlogPage() {
  const [posts, tags, featured] = await Promise.all([getAllPosts(), getAllTags(), getFeaturedPost()]);
  const rest = featured ? posts.filter((p) => p.slug !== featured.slug) : posts;
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D9FF4B]">Blog</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white md:text-7xl">Engineering notes</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-soft-white/65">Field notes from production systems — what worked, what broke, and what I’d do again.</p>
        </header>
        {featured && <div className="mb-12"><BlogHero post={featured} /></div>}
        <BlogListClient posts={rest} tags={tags} />
        <div className="mt-16"><BlogNewsletter /></div>
      </div>
    </div>
  );
}
