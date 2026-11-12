'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { BlogPostSummary } from '../../app/lib/blog-shared';
import { formatBlogDateShort } from '../../app/lib/blog-shared';
import type { PieceKind } from '../world/pieces';
import { webglOk } from '../marble/studio';
import type { Rider } from '../marble/Rider';
import { Arrow } from '../Navbar';

/** A piece to stand beside each note while the pointer is on it: decoration only, chosen from its topics. */
function pieceFor(p: BlogPostSummary): PieceKind {
  const t = p.tags.join(' ').toLowerCase();
  if (/agent|llm|ai\b/.test(t)) return 'knight';
  if (/microservice|architecture|java/.test(t)) return 'rook';
  if (/rag|retrieval/.test(t)) return 'bishop';
  if (/test|mobile|flutter/.test(t)) return 'pawn';
  return 'queen';
}

/**
 * The notes as title slabs: each one the full width of the page, its title at poster size, wiping in from
 * alternate sides as it arrives. On a fine pointer, a small marble piece follows the pointer over the notes, a
 * different piece for each. Search and topics narrow the list in place.
 */
export default function NotesIndex({ posts, tags }: { posts: BlogPostSummary[]; tags: string[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => posts.filter((p) =>
    (!active || p.tags.includes(active)) && (!q || `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase().includes(q))), [posts, active, q]);

  const list = useRef<HTMLOListElement>(null);
  const follow = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // each slab wipes in once, as it arrives
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    el.querySelectorAll('.nt-slab').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [rows]);

  // the piece that follows the pointer (listening on the whole index, which stays mounted while the list changes)
  useEffect(() => {
    const box = follow.current, cv = canvas.current, el = box?.parentElement;
    if (!el || !box || !cv || !webglOk()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let rider: Rider | null = null, raf = 0, dead = false, over = false, kind: PieceKind | null = null;
    let tx = 0, ty = 0, x = 0, y = 0, turn = 0, show = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      show += ((over ? 1 : 0) - show) * 0.12;
      turn += 0.012 + Math.abs(tx - x) * 0.0006;
      box.style.opacity = show.toFixed(3);
      box.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -62%) scale(${(0.85 + 0.15 * show).toFixed(3)})`;
      if (show > 0.01) rider?.draw(turn, Math.max(-0.2, Math.min(0.2, (tx - x) * 0.004)));
    };
    import('../marble/Rider').then(({ Rider }) => {
      if (dead) return;
      try { rider = new Rider(cv, 'knight', 'dark'); kind = 'knight'; raf = requestAnimationFrame(frame); } catch { /* the notes stand without it */ }
    });
    const onMove = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      const slab = (e.target as HTMLElement).closest<HTMLElement>('.nt-slab');
      over = !!slab;
      const k = slab?.dataset.piece as PieceKind | undefined;
      if (rider && k && k !== kind) { rider.setKind(k); kind = k; }
    };
    const onLeave = () => { over = false; };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      dead = true; cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave);
      rider?.dispose();
    };
  }, []);

  const clear = () => { setActive(null); setQuery(''); };

  return (
    <div className="nt-index">
      <div className="nt-tools lg-wrap">
        <div className="nt-topics" role="group" aria-label="Filter by topic">
          <button type="button" aria-pressed={!active} onClick={() => setActive(null)}>All</button>
          {tags.map((t) => <button key={t} type="button" aria-pressed={active === t} onClick={() => setActive(active === t ? null : t)}>{t}</button>)}
        </div>
        <label className="nt-search">
          <span className="lg-sr">Search the notes</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: RAG, Flutter, microservices" autoComplete="off" />
        </label>
        <p className="lg-note nt-count" role="status">{rows.length} of {posts.length} {posts.length === 1 ? 'note' : 'notes'}{active ? ` · ${active}` : ''}</p>
      </div>

      {rows.length > 0 ? (
        <ol ref={list} className="nt-list">
          {rows.map((p, i) => (
            <li key={p.slug} className={`nt-slab${i % 2 ? ' nt-slab--r' : ''}${p.featured && !active && !q ? ' nt-slab--lead' : ''}`} data-piece={pieceFor(p)}>
              <div className="nt-slab__in lg-wrap">
                <p className="lg-note nt-slab__meta">
                  <time dateTime={p.date}>{formatBlogDateShort(p.date)}</time> · {p.readingTime} min read{p.featured && !active && !q ? ' · featured' : ''}
                </p>
                <h2 className="nt-slab__title"><Link href={`/blog/${p.slug}`}>{p.title}</Link></h2>
                <div className="nt-slab__foot">
                  <p className="nt-slab__excerpt">{p.excerpt}</p>
                  <ul className="nt-slab__tags" aria-label="Topics">{p.tags.slice(0, 4).map((t) => <li key={t}>{t}</li>)}</ul>
                  <span className="nt-slab__go" aria-hidden="true">Read <Arrow /></span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="nt-empty lg-wrap">
          <p className="lg-body">Nothing matches that. Try another word or topic.</p>
          <button type="button" onClick={clear}>Show every note</button>
        </div>
      )}

      <div ref={follow} className="nt-follow" aria-hidden="true"><canvas ref={canvas} /></div>
    </div>
  );
}
