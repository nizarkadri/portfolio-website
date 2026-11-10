'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PROJECT_PLACEHOLDER_IMAGE, ProjectSummary } from '../../lib/project-shared';
import { Arrow, KingMark } from '../../../components/Navbar';
import '../../projects.css';

const GAP = 900;          // px between doors along the hall
const SEGMENT = 0.85;     // viewport-heights of scroll per door
const HOLD = 0.31;        // share of each segment spent standing still, at each end

const shortTitle = (t: string) => t.split(/\s+[-—]\s+|:\s+/)[0];
const hasCover = (p: ProjectSummary) => p.imageUrl !== PROJECT_PLACEHOLDER_IMAGE;

function Cover({ project, sizes, priority = false }: { project: ProjectSummary; sizes: string; priority?: boolean }) {
  if (hasCover(project)) {
    return <Image src={project.imageUrl} alt="" fill sizes={sizes} priority={priority} className="pj-cover__img" />;
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
      <Link href={`/projects/${project.slug}`} className={compact ? 'lg-link' : 'lg-cta lg-cta--sm'}>
        Case study {!compact && <Arrow />}
      </Link>
      {project.liveUrl && (
        <a href={project.liveUrl} target="_blank" rel="noreferrer noopener" className="lg-link" aria-label={`Live preview of ${shortTitle(project.title)} (opens in a new tab)`}>
          Live preview
        </a>
      )}
      {project.repoUrl && (
        <a href={project.repoUrl} target="_blank" rel="noreferrer noopener" className="lg-link" aria-label={`Source code of ${shortTitle(project.title)} (opens in a new tab)`}>
          Code
        </a>
      )}
    </div>
  );
}

export default function ProjectsClient({ projects }: { projects: ProjectSummary[] }) {
  const act = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const items = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState('');
  const [tech, setTech] = useState<string | null>(null);
  const [sort, setSort] = useState<'featured' | 'year' | 'title'>('featured');

  // The hall: scroll walks the camera from door to door. Each door is a stop:
  // the walk only happens in the middle of a segment, so the door in front of
  // you stands still, fully lit, for most of the scroll that belongs to it.
  useEffect(() => {
    const el = act.current, tr = track.current;
    if (!el || !tr) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, last = -1, lastZ = NaN;
    const n = projects.length;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      const s = p * (n - 1);
      const i = Math.max(0, Math.min(n - 2, Math.floor(s)));
      const f = Math.min(1, Math.max(0, (s - i - HOLD) / (1 - 2 * HOLD)));
      const walk = n > 1 ? i + f * f * (3 - 2 * f) : 0;
      const z = walk * GAP;
      if (Math.abs(z - lastZ) < 0.05) return;
      lastZ = z;
      tr.style.transform = `translate3d(0,0,${z.toFixed(1)}px)`;
      if (back.current) back.current.style.transform = `scale(${(1.02 + p * 0.1).toFixed(4)})`;
      const best = Math.round(walk);
      items.current.forEach((node, k) => {
        if (!node) return;
        const d = k * GAP - z;                                         // distance still to walk
        const near = Math.min(1, Math.max(0, 1 + d / (GAP * 0.42)));   // a passed door leaves quickly
        const far = Math.min(1, Math.max(0, 1 - (d - GAP * 1.1) / (GAP * 2.2)));
        const o = k === best ? near : near * far * 0.9;
        node.style.opacity = o.toFixed(3);
        node.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      });
      if (best !== last) { last = best; setActive(best); }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [projects.length]);

  const walkTo = (i: number) => {
    const el = act.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (el.offsetHeight - window.innerHeight) * (i / Math.max(1, projects.length - 1));
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const techs = useMemo(() => {
    const count = new Map<string, number>();
    projects.forEach((p) => p.technologies.forEach((t) => count.set(t, (count.get(t) || 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);
  }, [projects]);

  const filtered = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const list = projects.filter((p) => {
      if (tech && !p.technologies.includes(tech)) return false;
      const hay = [p.title, p.description, p.summary, p.status, p.impact, p.year, ...p.technologies].join(' ').toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    if (sort === 'year') return [...list].sort((a, b) => (parseInt(b.year || '0', 10) || 0) - (parseInt(a.year || '0', 10) || 0));
    if (sort === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [projects, query, tech, sort]);

  const span = ((projects.length - 1) * SEGMENT + 1).toFixed(2);

  return (
    <div className="pj">
      {/* The hall. Door one is already in view: the collection starts at the top.
          The doors live in the 3D scene; the label for the door in front of you
          is flat, still and always clickable. */}
      <section ref={act} className="pj-hall" data-sc-act="pin" data-sc-span={span} data-sc-drift="#070b14" aria-label="Project hall">
        <div data-sc-stage className="pj-hall__stage">
          <div ref={back} className="pj-hall__back" aria-hidden="true" />
          <div className="pj-hall__scene" aria-hidden="true">
            <div ref={track} className="pj-hall__track" style={{ ['--gap' as string]: `${GAP}px` }}>
              {projects.map((p, i) => (
                <div
                  key={p.slug}
                  ref={(n) => { items.current[i] = n; }}
                  className={`pj-door${i === active ? ' is-active' : ''}`}
                  style={{ ['--i' as string]: i }}
                >
                  <div className="pj-door__frame">
                    <div className="pj-cover"><Cover project={p} sizes="(max-width: 860px) 86vw, 38rem" priority={i < 2} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pj-hall__fog" aria-hidden="true" />

          <header className="pj-hall__head">
            <h1 className="lg-display lg-display--sm">The work</h1>
            <p className="lg-note">{String(active + 1).padStart(2, '0')} of {projects.length}</p>
            <a href="#index" className="lg-link">Index</a>
          </header>

          <div className="pj-plates">
            {projects.map((p, i) => (
              <article
                key={p.slug}
                className={`pj-plate${i === active ? ' is-active' : ''}`}
                aria-hidden={i === active ? undefined : true}
                inert={i !== active}
              >
                <p className="lg-note">{[p.year, p.status].filter(Boolean).join(' · ')}</p>
                <h2 className="lg-display lg-display--md">{shortTitle(p.title)}</h2>
                <p className="pj-plate__sum">{p.summary}</p>
                <ul className="pj-stack" aria-label="Stack">
                  {p.technologies.slice(0, 5).map((t) => <li key={t} className="lg-chip">{t}</li>)}
                </ul>
                <Links project={p} />
              </article>
            ))}
          </div>

          <ol className="pj-hall__rail" aria-label="Jump to a project">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <button type="button" aria-label={shortTitle(p.title)} aria-current={i === active ? 'true' : undefined} onClick={() => walkTo(i)} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The index: every door, as a ledger you can search. */}
      <section id="index" className="pj-index lg-section tone-day tone-ground">
        <div className="lg-wrap">
          <div className="pj-index__head">
            <h2 className="lg-display lg-display--lg">Index</h2>
            <p className="lg-body">Every project, with the same label on each: what it is, when, what it runs on.</p>
          </div>
          <div className="pj-tools" role="search">
            <label className="pj-search">
              <span className="lg-note">Search</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="RAG, Flutter, Azure" autoComplete="off" />
            </label>
            <label className="pj-sort">
              <span className="lg-note">Order</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                <option value="featured">Featured first</option>
                <option value="year">Newest</option>
                <option value="title">A to Z</option>
              </select>
            </label>
            <div className="pj-filter" role="group" aria-label="Filter by technology">
              {techs.map(([t, n]) => (
                <button key={t} type="button" className="lg-chip" aria-pressed={tech === t} onClick={() => setTech(tech === t ? null : t)}>
                  {t} <span>{n}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="lg-note pj-count" aria-live="polite">{filtered.length} of {projects.length} shown</p>
          {filtered.length === 0 ? (
            <div className="pj-empty">
              <p className="lg-body">Nothing matches that. </p>
              <button type="button" className="lg-link" onClick={() => { setQuery(''); setTech(null); }}>Clear the filters</button>
            </div>
          ) : (
            <ul className="pj-rows">
              {filtered.map((p) => (
                <li key={p.slug} className="pj-row">
                  <div className="pj-row__cover pj-cover"><Cover project={p} sizes="12rem" /></div>
                  <div className="pj-row__main">
                    <h3 className="lg-display lg-display--sm"><Link href={`/projects/${p.slug}`}>{shortTitle(p.title)}</Link></h3>
                    <p>{p.summary}</p>
                    <ul className="pj-stack" aria-label="Stack">
                      {p.technologies.slice(0, 6).map((t) => <li key={t} className="lg-chip">{t}</li>)}
                    </ul>
                  </div>
                  <div className="pj-row__meta">
                    <p className="lg-note">{[p.year, p.status].filter(Boolean).join(' · ')}</p>
                    <Links project={p} compact />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
