'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
        <a href={project.liveUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Live preview of ${shortTitle(project.title)}${project.liveInviteOnly ? ', invite only: ask for an invite on the contact page' : ''} (opens in a new tab)`}>
          {project.liveInviteOnly ? 'Live · invite' : 'Live preview'}
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
 * The work without the scene: a plain list you read, for a browser with no WebGL or a visitor who has asked
 * for less motion. Every project is a line of type that is always there to click, and on a wide screen one
 * steady panel beside the list shows the project you are on.
 */
function PlainList({ projects }: { projects: ProjectSummary[] }) {
  const list = useRef<HTMLOListElement>(null);
  const on = useRef(0);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(-1);

  const pick = useCallback((i: number) => {
    if (i === on.current) return;
    setPrev(on.current);
    on.current = i;
    setActive(i);
  }, []);

  // On a wide screen the row at the reading line is the one you are on, unless the pointer is resting on another.
  useEffect(() => {
    const el = list.current;
    if (!el || !window.matchMedia('(min-width: 861px)').matches) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let raf = 0, px = -1, py = -1, inside = false;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      let i = -1;
      if (fine && inside) {
        const hit = document.elementFromPoint(px, py)?.closest<HTMLElement>('[data-row]');
        if (hit) i = Number(hit.dataset.row);
      }
      if (i < 0) {
        const line = window.innerHeight * 0.42;
        let best = Infinity;
        el.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
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
    };
  }, [pick]);

  const current = projects[Math.min(active, projects.length - 1)];

  return (
    <section className="pj-board lg-wrap" aria-label="Projects">
      <div className="pj-board__pin">
        <ol ref={list} className="pj-list">
          {projects.map((p, i) => (
            <li key={p.slug} data-row={i} className={`pj-item${i === active ? ' is-active' : ''}`}>
              <div className="pj-item__cover pj-cover"><Cover project={p} sizes="(max-width: 860px) 92vw, 1px" /></div>
              <p className="lg-note pj-item__year">{p.year}</p>
              <h2 className="pj-item__title">
                <Link href={`/projects/${p.slug}`} onFocus={() => pick(i)}>{shortTitle(p.title)}</Link>
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

        {/* The panel: one frame, one label. It stays where it is and shows the project you are on. */}
        {current && (
          <aside className="pj-view" aria-label={`Preview: ${shortTitle(current.title)}`}>
            <div className="pj-view__frame">
              {projects.map((p, i) => (
                <div key={p.slug} className={`pj-view__img${i === active ? ' is-on' : i === prev ? ' is-prev' : ''}`}>
                  <Cover project={p} sizes="(max-width: 860px) 1px, 42vw" eager />
                </div>
              ))}
            </div>
            <div className="pj-view__text" key={current.slug}>
              <p className="lg-note">{[current.year, current.status].filter(Boolean).join(' · ')}</p>
              <p className="pj-view__sum">{current.summary}</p>
              <ul className="pj-stack" aria-label="Stack">
                {current.technologies.slice(0, 6).map((t) => <li key={t} className="lg-chip">{t}</li>)}
              </ul>
              <Links project={current} />
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

/**
 * The Work page is the scene and nothing after it: the scene walks the projects one at a time and ends on its
 * own plan, where every project can be picked and read at a glance. The plain list is only what stands in for
 * the scene where there cannot be one.
 */
export default function ProjectsClient({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="pj">
      <WorkWorld projects={projects} fallback={<PlainList projects={projects} />} />
    </div>
  );
}
