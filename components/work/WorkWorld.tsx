'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PROJECT_PLACEHOLDER_IMAGE, ProjectSummary } from '../../app/lib/project-shared';
import { Arrow } from '../Navbar';
import { Chars } from '../Kinetic';
import type { Orrery } from './Orrery';

const STEP = 0.82;        // viewport heights of scroll each project owns
const SETTLE = 0.62;      // how much the scroll slows as a project arrives (0 = not at all). It never stops.

const shortTitle = (t: string) => t.split(/\s+[-—]\s+|:\s+/)[0];
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scroll progress to a place among the projects. The scene is scrubbed by the
 * scroll: every bit of scroll moves it, forwards or back. It only eases a
 * little as each project arrives, so there is a moment to read it.
 */
function place(p: number, n: number) {
  if (n < 2) return 0;
  const x = clamp(p) * (n - 1);
  const i = Math.min(n - 2, Math.floor(x));
  const t = x - i;
  return i + t + (t * t * (3 - 2 * t) - t) * SETTLE;
}

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The work as a small world you scroll through. The scene is one WebGL canvas;
 * the words are ordinary markup beside it, so they are sharp, they hold still,
 * and their links are always there to click.
 */
export default function WorkWorld({ projects }: { projects: ProjectSummary[] }) {
  const act = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<Orrery | null>(null);
  const label = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<'pending' | 'live' | 'off'>('pending');
  const n = projects.length;

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMode(reduce || !webglOk() ? 'off' : 'live');
  }, []);

  const walkTo = useCallback((i: number) => {
    const el = act.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (el.offsetHeight - window.innerHeight) * (i / Math.max(1, n - 1));
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  }, [n]);

  useEffect(() => {
    if (mode !== 'live' || !canvas.current || !act.current) return;
    const el = act.current, cv = canvas.current;
    const mobile = window.matchMedia('(max-width: 860px)').matches;
    let dead = false, raf = 0, last = -1, w: Orrery | null = null;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      const f = place(-r.top / Math.max(1, r.height - window.innerHeight), n);
      // one number, one frame: the scene is drawn at this place now, and the words are set
      // from the same number. They leave as their globe leaves, arrive as the next one does,
      // and change while they are out of sight.
      w?.draw(f);
      const here = Math.min(n - 1, Math.max(0, Math.round(f)));
      const d = f - here;
      const k = Math.min(1, Math.max(0, (0.42 - Math.abs(d)) / 0.25));
      const o = k * k * (3 - 2 * k);
      if (label.current) {
        label.current.style.opacity = o.toFixed(3);
        label.current.style.transform = `translate3d(0, ${(-d * 34).toFixed(1)}px, 0)`;
        label.current.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      }
      if (here !== last) { last = here; setActive(here); }
    };

    import('./Orrery').then(({ Orrery }) => {
      if (dead) return;
      try {
        w = new Orrery(cv, {
          mobile,
          covers: projects.map((p) => (p.imageUrl === PROJECT_PLACEHOLDER_IMAGE ? '' : p.imageUrl)),
          stacks: projects.map((p) => p.technologies),
          font: getComputedStyle(document.documentElement).getPropertyValue('--font-geist-mono').trim() || undefined,
        });
      } catch {
        setMode('off');
        return;
      }
      world.current = w;
      (window as unknown as { __orrery?: Orrery }).__orrery = w;
      w.start();
      el.classList.add('is-live');
    });
    raf = requestAnimationFrame(frame);

    const onResize = () => w?.resize();
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !w) return;
      w.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
      cv.style.cursor = w.pickAt(e.clientX, e.clientY) !== null ? 'pointer' : '';
    };
    const onClick = (e: MouseEvent) => {
      const i = w?.pickAt(e.clientX, e.clientY);
      if (i !== null && i !== undefined) walkTo(i);
    };
    const onVis = () => (document.hidden ? w?.stop() : w?.start());
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    cv.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      cv.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVis);
      w?.dispose();
      world.current = null;
    };
  }, [mode, n, projects, walkTo]);

  // Without motion or WebGL there is no world to walk: the page opens on its heading and the list.
  if (mode === 'off') {
    return (
      <header className="pj-top lg-wrap pw-plain">
        <p className="lg-note hero__eyebrow"><i aria-hidden="true" />{n} projects</p>
        <h1 className="lg-display pj-title">The work</h1>
      </header>
    );
  }

  const current = projects[Math.min(active, n - 1)];
  const span = (n * STEP + 1).toFixed(2);

  return (
    <section ref={act} className="pw" data-sc-act="pin" data-sc-span={span} data-sc-drift="#e3f2fb" aria-label="The work">
      <div data-sc-stage className="pw__stage">
        <canvas ref={canvas} className="pw__canvas" aria-hidden="true" />

        <header className="pw__head">
          <p className="lg-note hero__eyebrow lg-up"><i aria-hidden="true" />{n} projects</p>
          <h1 className="lg-display pw__title"><Chars text="The work" /></h1>
        </header>

        {/* The label: flat markup. The scroll moves it in and out with its globe; it changes only while out of sight. */}
        <div ref={label} className="pw__label" aria-live="polite">
          <p className="lg-note">{[current.year, current.status].filter(Boolean).join(' · ')}</p>
          <h2 className="lg-display pw__name">{shortTitle(current.title)}</h2>
          <p className="pw__sum">{current.summary}</p>
          <ul className="pw__stack" aria-label="Stack">
            {current.technologies.slice(0, 5).map((t) => <li key={t} className="lg-chip">{t}</li>)}
          </ul>
          <div className="pw__links">
            <Link href={`/projects/${current.slug}`} className="lg-cta lg-cta--sm">Case study <Arrow /></Link>
            {current.liveUrl && (
              <a href={current.liveUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Live preview of ${shortTitle(current.title)} (opens in a new tab)`}>Live preview</a>
            )}
            {current.repoUrl && (
              <a href={current.repoUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Source code of ${shortTitle(current.title)} (opens in a new tab)`}>Code</a>
            )}
          </div>
        </div>

        <div className="pw__foot">
          <ol className="pw__rail" aria-label="Jump to a project">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <button type="button" aria-label={shortTitle(p.title)} aria-current={i === active ? 'true' : undefined} onClick={() => walkTo(i)} />
              </li>
            ))}
          </ol>
          <a href="#index" className="pj-pill">All {n} as a list</a>
        </div>
      </div>
    </section>
  );
}
