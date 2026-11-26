import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, getAllTags } from '../../lib/blog';
import NotesIndex from '../../../components/blog/NotesIndex';
import PieceCanvas from '../../../components/marble/PieceCanvas';
import { Chars } from '../../../components/Kinetic';
import '../../blog-contact.css';
import '../../notes.css';

export const metadata: Metadata = {
  title: 'Blog: AI Engineering Notes',
  description: 'Notes from building with AI: agent workflows, RAG in practice, MCP tooling, and AI-driven mobile testing.',
  openGraph: { title: 'Blog: AI Engineering Notes', description: 'Notes from building with AI: agent workflows, RAG in practice, MCP tooling, and AI-driven mobile testing.', type: 'website' },
};

/**
 * The notes, as a typographic poster: NOTES at the full width of the page with a marble knight standing in front of
 * it, then every note as a title slab, then one quiet line at the end.
 */
export default async function BlogPage() {
  const [posts, tags] = await Promise.all([getAllPosts(), getAllTags()]);
  const minutes = posts.reduce((n, p) => n + p.readingTime, 0);

  return (
    <div className="nt">
      <header className="nt-hero">
        <h1 className="nt-hero__word" aria-label="Engineering notes"><Chars text="Notes" /></h1>
        <PieceCanvas kind="knight" tone="dark" className="nt-hero__piece" turn={0.004} still={-0.4} />
        <div className="nt-hero__foot lg-wrap">
          <p className="lg-body lg-body--lg lg-up" style={{ ['--d' as string]: 520 }}>
            Engineering notes from production systems: what worked, what broke, and what I would do again.
          </p>
          <p className="lg-note lg-up" style={{ ['--d' as string]: 640 }}>{posts.length} notes · {minutes} minutes of reading</p>
        </div>
      </header>

      <NotesIndex posts={posts} tags={tags} />

      <p className="nt-end lg-wrap">
        That is every note so far. If one of them is close to something you are building, <Link href="/contact">make your move</Link>.
      </p>
    </div>
  );
}
