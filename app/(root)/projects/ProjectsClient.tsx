'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PROJECT_PLACEHOLDER_IMAGE, ProjectSummary } from '../../lib/project-shared';
import { Arrow, KingMark } from '../../../components/Navbar';
import WorkWorld from '../../../components/work/WorkWorld';
import '../../projects.css';

const shortTitle = (t: string) => t.split(/\s+[-—]\s+|:\s+/)[0];
const hasCover = (p: ProjectSummary) => p.imageUrl !== PROJECT_PLACEHOLDER_IMAGE;

function Cover({ project, sizes, eager = false }: { project: ProjectSummary; sizes: string; eager?: boolean }) {
  if (hasCover(project)) {
    return <Image src={project.imageUrl} alt="" fill sizes={sizes} loading={eager ? 'eager' : 'lazy'} className="pj-cover__img" />;
  }
  return (
    <div className="pj-cover__blank" aria-hidden="true">
      <KingMark />
      <span>{shortTitle(project.title).slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

function Links({ project, compact = false }: { project: ProjectSummary; compact?: boolean }) {
  return (
    <div className="pj-links">
      <Link href={`/projects/${project.slug}`} className={compact ? 'pj-pill' : 'lg-cta lg-cta--sm'}>
        Case study {!compact && <Arrow />}
      </Link>
      {project.liveUrl && (
        <a href={project.liveUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Live preview of ${shortTitle(project.title)} (opens in a new tab)`}>
          Live preview
        </a>
      )}
      {project.repoUrl && (
        <a href={project.repoUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Source code of ${shortTitle(project.title)} (opens in a new tab)`}>
          Code
        </a>
      )}
    </div>
  );
}

/**
 * The work, as a list you read. Nothing floats and nothing flies past:
 * every project is a line of type that is always there to click, and one
 * steady panel beside the list shows the project you are on.
 */
export default function ProjectsClient({ projects }: { projects: ProjectSummary[] }) {
  const board = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const walk = useRef<(i: number) => void>(() => {});
  const on = useRef(0);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [query, setQuery] = useState('');
  const [tech, setTech] = useState<string | null>(null);
  const [sort, setSort] = useState<'featured' | 'year' | 'title'>('featured');

  const techs = useMemo(() => {
    const count = new Map<string, number>();
    projects.forEach((p) => p.technologies.forEach((t) => count.set(t, (count.get(t) || 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);
  }, [projects]);

  const filtered = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = projects.filter((p) => {
      if (tech && !p.technologies.includes(tech)) return false;
      const hay = [p.title, p.description, p.summary, p.status, p.impact, p.year, ...p.technologies].join(' ').toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    if (sort === 'year') return [...rows].sort((a, b) => (parseInt(b.year || '0', 10) || 0) - (parseInt(a.year || '0', 10) || 0));
    if (sort === 'title') return [...rows].sort((a, b) => a.title.localeCompare(b.title));
    return rows;
  }, [projects, query, tech, sort]);

  const empty = filtered.length === 0;

  const pick = useCallback((i: number) => {
    if (i === on.current) return;
    setPrev(on.current);
    on.current = i;
    setActive(i);
  }, []);

  // A different set of rows: start again from the first of them.
  useEffect(() => { on.current = 0; setActive(0); setPrev(-1); }, [filtered]);

  // On a wide screen the list is paced like the world above it: it pins, and the scroll moves
  // it one row at a time, slowly and evenly, with the panel beside it. The row at the reading
  // line is the one you are on, unless the pointer is resting on another.
  useEffect(() => {
    const el = list.current, brd = board.current;
    if (!el || !brd || !window.matchMedia('(min-width: 861px)').matches) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const paced = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pin = brd.querySelector<HTMLElement>('.pj-board__pin');
    const win = el.parentElement;
    if (paced) brd.classList.add('is-paced');
    let raf = 0, px = -1, py = -1, inside = false;

    const travel = () => Math.max(1, brd.offsetHeight - (pin?.offsetHeight ?? 0));
    const pinTop = () => (pin ? parseFloat(getComputedStyle(pin).top) || 0 : 0);
    walk.current = (i: number) => {
      const rows = el.querySelectorAll('[data-row]').length;
      if (!paced || rows < 2) return;
      const top = brd.getBoundingClientRect().top + window.scrollY - pinTop();
      window.scrollTo({ top: top + travel() * (i / (rows - 1)), behavior: 'auto' });
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = brd.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const rows = Array.from(el.querySelectorAll<HTMLElement>('[data-row]'));
      const n = rows.length;
      if (!n) return;
      let i = -1;
      if (paced && win) {
        // where the scroll has got to, in rows; the list slides so that place sits on the reading line
        const p = Math.min(1, Math.max(0, (pinTop() - r.top) / travel()));
        const f = p * (n - 1);
        const a = Math.min(n - 1, Math.floor(f)), b = Math.min(n - 1, a + 1), t = f - a;
        const mid = (row: HTMLElement) => row.offsetTop + row.offsetHeight / 2;
        const at = mid(rows[a]) + (mid(rows[b]) - mid(rows[a])) * t;
        el.style.transform = `translate3d(0, ${(win.clientHeight * 0.4 - at).toFixed(1)}px, 0)`;
        i = Math.round(f);
      }
      if (fine && inside) {
        const hit = document.elementFromPoint(px, py)?.closest<HTMLElement>('[data-row]');
        if (hit) i = Number(hit.dataset.row);
      }
      if (i < 0) {
        const line = window.innerHeight * 0.42;
        let best = Infinity;
        rows.forEach((row) => {
          const box = row.getBoundingClientRect();
          const d = Math.abs((box.top + box.bottom) / 2 - line);
          if (d < best) { best = d; i = Number(row.dataset.row); }
        });
      }
      if (i >= 0) pick(i);
    };
    const move = (e: PointerEvent) => { px = e.clientX; py = e.clientY; };
    const enter = () => { inside = true; };
    const leave = () => { inside = false; };
    window.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      brd.classList.remove('is-paced');
      el.style.transform = '';
      walk.current = () => {};
    };
  }, [pick, empty]);

  const current = filtered[Math.min(active, filtered.length - 1)];

  return (
    <div className="pj">
      <WorkWorld projects={projects} />

      <header id="index" className="pj-top lg-wrap">
        <h2 className="lg-display pj-index-title">Every project, as a list.</h2>
        <p className="lg-body lg-body--lg">
          The same label on each: what it is, when, and what it runs on.
        </p>
      </header>

      <div className="pj-tools lg-wrap" role="search">
        <label className="pj-search">
          <span className="lg-sr">Search the projects</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: RAG, Flutter, Python" autoComplete="off" />
        </label>
        <label className="pj-sort">
          <span className="lg-sr">Order</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="featured">My order</option>
            <option value="year">Newest</option>
            <option value="title">A to Z</option>
          </select>
        </label>
        <div className="pj-filter" role="group" aria-label="Filter by technology">
          {techs.map(([t, count]) => (
            <button key={t} type="button" className="lg-chip" aria-pressed={tech === t} onClick={() => setTech(tech === t ? null : t)}>
              {t} <span>{count}</span>
            </button>
          ))}
        </div>
      </div>

      <section ref={board} className="pj-board lg-wrap" aria-label="Projects" style={{ ['--rows' as string]: filtered.length }}>
        <div className="pj-board__pin">
        <div className="pj-board__list">
          <p className="lg-note pj-count" aria-live="polite">{filtered.length} of {projects.length} shown</p>
          {filtered.length === 0 ? (
            <div className="pj-empty">
              <p className="lg-body">Nothing matches that.</p>
              <button type="button" className="pj-pill" onClick={() => { setQuery(''); setTech(null); }}>Clear the filters</button>
            </div>
          ) : (
            <div className="pj-list__window">
            <ol ref={list} className="pj-list">
              {filtered.map((p, i) => (
                <li key={p.slug} data-row={i} className={`pj-item${i === active ? ' is-active' : ''}`} style={{ ['--d' as string]: 640 + Math.min(i, 10) * 55 }}>
                  <div className="pj-item__cover pj-cover"><Cover project={p} sizes="(max-width: 860px) 92vw, 1px" /></div>
                  <p className="lg-note pj-item__year">{p.year}</p>
                  <h2 className="pj-item__title">
                    <Link href={`/projects/${p.slug}`} onFocus={(e) => { pick(i); if (e.target.matches(':focus-visible')) walk.current(i); }}>{shortTitle(p.title)}</Link>
                  </h2>
                  <p className="lg-note pj-item__status">{p.status}</p>
                  <span className="pj-item__go" aria-hidden="true"><Arrow /></span>
                  <div className="pj-item__more">
                    <p className="pj-item__sum">{p.summary}</p>
                    <ul className="pj-stack" aria-label="Stack">
                      {p.technologies.slice(0, 5).map((t) => <li key={t} className="lg-chip">{t}</li>)}
                    </ul>
                    <Links project={p} compact />
                  </div>
                </li>
              ))}
            </ol>
            </div>
          )}
        </div>

        {/* The panel: one frame, one label. It stays where it is and shows the project you are on. */}
        {current && (
          <aside className="pj-view" aria-label={`Preview: ${shortTitle(current.title)}`}>
            <div className="pj-view__frame">
              {filtered.map((p, i) => (
                <div key={p.slug} className={`pj-view__img${i === active ? ' is-on' : i === prev ? ' is-prev' : ''}`}>
                  <Cover project={p} sizes="(max-width: 860px) 1px, 42vw" eager />
                </div>
              ))}
            </div>
            <div className="pj-view__text" key={current.slug}>
              <p className="lg-note lg-up">{[current.year, current.status].filter(Boolean).join(' · ')}</p>
              <p className="pj-view__sum lg-up" style={{ ['--d' as string]: 60 }}>{current.summary}</p>
              <ul className="pj-stack lg-up" style={{ ['--d' as string]: 120 }} aria-label="Stack">
                {current.technologies.slice(0, 6).map((t) => <li key={t} className="lg-chip">{t}</li>)}
              </ul>
              <div className="lg-up" style={{ ['--d' as string]: 180 }}><Links project={current} /></div>
            </div>
          </aside>
        )}
        </div>
      </section>
    </div>
  );
}
