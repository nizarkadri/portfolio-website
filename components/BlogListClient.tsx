"use client";
import { useMemo, useState } from 'react';
import type { BlogPostSummary } from '../app/lib/blog-shared';
import { BlogHero, BlogRow } from './BlogCard';

/**
 * The index. With no search and no topic chosen, the featured post leads and the
 * rest follow as a ledger. As soon as the visitor filters, every post (the
 * featured one included) is searched and shown as plain rows.
 */
export default function BlogListClient({ posts, tags, featured = null }: { posts: BlogPostSummary[]; tags: string[]; featured?: BlogPostSummary | null }) {
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtering = Boolean(active || q);

  const rows = useMemo(() => {
    if (!filtering) return featured ? posts.filter((p) => p.slug !== featured.slug) : posts;
    return posts.filter((p) =>
      (!active || p.tags.includes(active)) &&
      (!q || `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase().includes(q)));
  }, [posts, featured, active, q, filtering]);

  const shown = rows.length + (!filtering && featured ? 1 : 0);
  const topic = (t: string | null, label: string) => (
    <button key={label} type="button" className="bc-pill" onClick={() => setActive(t)} aria-pressed={active === t}>{label}</button>
  );
  const clear = () => { setActive(null); setQuery(''); };

  return (
    <div className="bl-list">
      <div className="bl-tools">
        <div className="fx-field">
          <label className="fx-label" htmlFor="blog-search">Search the notes</label>
          <input id="blog-search" type="search" className="fx-input" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="RAG, Flutter, microservices" autoComplete="off" />
        </div>
        <div className="bl-pills" role="group" aria-label="Filter by topic">
          {topic(null, 'All')}{tags.map((t) => topic(t, t))}
        </div>
      </div>

      <p className="bl-count lg-note" role="status">
        {shown} of {posts.length} {posts.length === 1 ? 'note' : 'notes'}{active ? <> · <b>{active}</b></> : null}
      </p>

      {!filtering && featured && <BlogHero post={featured} />}

      {rows.length > 0 && (
        <ol className="bl-ledger">
          {rows.map((p, i) => <BlogRow key={p.slug} post={p} index={i} />)}
        </ol>
      )}

      {filtering && rows.length === 0 && (
        <div className="bl-empty">
          <p className="lg-body">Nothing matches that search. Try another word or topic.</p>
          <button type="button" className="bc-btn" onClick={clear}>Show every note</button>
        </div>
      )}
    </div>
  );
}
