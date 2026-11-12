'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PROJECT_PLACEHOLDER_IMAGE, ProjectSummary } from '../../app/lib/project-shared';
import { Arrow } from '../Navbar';
import { Chars } from '../Kinetic';
import type { Orrery } from './Orrery';

const STEP = 0.82;        // viewport heights of scroll each project owns
const HOLD = 0.2;         // at each end of a step, the share of it where the project is all but still
const CREEP = 0.14;       // how much it still moves while held, so the scroll never feels stuck

const shortTitle = (t: string) => t.split(/\s+[-—]\s+|:\s+/)[0];
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => { const k = clamp(v); return k * k * (3 - 2 * k); };

/**
 * How far in a piece of the words is, 0 to 1, at distance d from its project.
 * `s` (0 to 1) is its place in the order: the first piece arrives first and
 * also leaves first, whichever way the scroll is going. Every piece is fully
 * in while d is within FULL, which covers most of each project's scroll.
 */
const GONE = 0.42, FADE = 0.18, FULL = 0.12;
const SPREAD = GONE - FADE - FULL;
function rise(d: number, s: number) {
  const order = d < 0 ? s : 1 - s;
  return ease((GONE - Math.abs(d) - order * SPREAD) / FADE);
}

/** A title as words of single letters, so the scroll can raise them one at a time. */
function Letters({ text }: { text: string }) {
  return (
    <>
      <span className="lg-sr">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((word, wi, all) => (
          <React.Fragment key={wi}>
            <span className="pw__w">
              {Array.from(word).map((ch, ci) => <span key={ci} className="pw__ch">{ch}</span>)}
            </span>
            {wi < all.length - 1 ? ' ' : null}
          </React.Fragment>
        ))}
      </span>
    </>
  );
}

/**
 * Scroll progress to a place among the projects. The scene is scrubbed by the
 * scroll: every bit of scroll moves it, forwards or back. Near each project it
 * only creeps, so there is time to read it; the change from one to the next
 * happens in the middle of the step.
 */
function place(p: number, n: number) {
  if (n < 2) return 0;
  const x = clamp(p) * (n - 1);
  const i = Math.min(n - 2, Math.floor(x));
  const t = x - i;
  return i + (1 - CREEP) * ease((t - HOLD) / (1 - 2 * HOLD)) + CREEP * t;
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
  const after = useRef<HTMLDivElement>(null);
  const lead = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const chars = useRef<HTMLElement[]>([]);
  const parts = useRef<HTMLElement[]>([]);
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

  // the letters and lines of the words on show, found again whenever the project changes
  useLayoutEffect(() => {
    const el = act.current;
    if (!el) return;
    chars.current = Array.from(el.querySelectorAll<HTMLElement>('.pw__ch'));
    parts.current = Array.from(el.querySelectorAll<HTMLElement>('[data-part]'));
    chars.current.forEach((c) => { c.dataset.p = ''; });
  }, [active, mode]);

  useEffect(() => {
    if (mode !== 'live' || !canvas.current || !act.current) return;
    const el = act.current, cv = canvas.current;
    const mobile = window.matchMedia('(max-width: 860px)').matches;
    let dead = false, raf = 0, last = -1, w: Orrery | null = null;
    // On a wide screen the words sit level with the globe, joined to it by a line.
    // Anywhere narrower they stay together at the foot of the scene.
    let float = false, panelRight = 0, panelH = 0, headBottom = 0;
    const measure = () => {
      const lb = label.current, hd = el.querySelector<HTMLElement>('.pw__head');
      panelRight = lb ? lb.offsetLeft + lb.offsetWidth : 0;
      panelH = lb ? lb.offsetHeight : 0;
      headBottom = hd ? hd.offsetTop + hd.offsetHeight : 0;
    };
    const layout = () => {
      float = window.innerWidth > 860 && window.innerWidth / window.innerHeight >= 1.25;
      el.classList.toggle('pw--float', float);
      measure();
    };
    layout();
    // the panel's size changes with each project's words
    const sizes = new ResizeObserver(measure);
    if (label.current) sizes.observe(label.current);

    // the bar at the top of the window goes dark while the room, or the dark half of the
    // fade below it, is what it sits on
    const root = document.documentElement;
    let barDark = false;
    const setBar = (on: boolean) => { if (on !== barDark) { barDark = on; root.classList.toggle('lg-bar-dark', on); } };
    let barMid = 34;
    const measureBar = () => { barMid = (document.querySelector<HTMLElement>('.lg-bar')?.offsetHeight ?? 68) / 2; };
    measureBar();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = el.getBoundingClientRect();
      const fade = after.current?.getBoundingClientRect();
      setBar(r.top < barMid && (fade ? fade.top + fade.height * 0.45 : r.bottom) > barMid);
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      const f = place(-r.top / Math.max(1, r.height - window.innerHeight), n);
      // one number, one frame: the scene is drawn at this place now, and the words are set
      // from the same number. They leave as their globe leaves, arrive as the next one does,
      // and change while they are out of sight.
      w?.draw(f);
      const here = Math.min(n - 1, Math.max(0, Math.round(f)));
      const d = f - here;
      const o = ease((GONE - Math.abs(d)) / 0.25);
      const up = d < 0 ? 1 : -1;   // arriving words come up from below, leaving words carry on upwards

      const lb = label.current;
      if (float && w) {
        const a = w.focusOnScreen();
        // the panel sits level with the globe, but never climbs into the heading
        const py = Math.max(a.y, headBottom + 20 + panelH / 2);
        if (lb) lb.style.transform = `translate3d(0, ${py.toFixed(1)}px, 0) translateY(-50%)`;
        // the line is drawn out of the globe towards the words, level with both
        const ly = Math.min(Math.max(a.y, py - panelH / 2 + 28), py + panelH / 2 - 28);
        const dy = Math.min(Math.abs(ly - a.y), a.r * 0.9);
        const start = panelRight + 18, end = a.x - Math.sqrt(a.r * a.r - dy * dy) - 16, len = Math.max(0, end - start);
        const p = rise(d, 0);
        if (lead.current) lead.current.style.transform = `translate3d(${(end - len * p).toFixed(1)}px, ${ly.toFixed(1)}px, 0) scaleX(${(len * p / 100).toFixed(3)})`;
        if (dot.current) dot.current.style.transform = `translate3d(${end.toFixed(1)}px, ${ly.toFixed(1)}px, 0) scale(${o.toFixed(3)})`;
      } else if (lb) {
        lb.style.transform = `translate3d(0, ${(-d * 34).toFixed(1)}px, 0)`;
      }
      if (lb) {
        lb.style.opacity = o.toFixed(3);
        // while the words are mostly out of sight, nothing in them can be clicked, tabbed to or read out
        const away = o <= 0.5;
        if (lb.inert !== away) lb.inert = away;
      }

      // the name, letter by letter
      const cs = chars.current, m = cs.length;
      for (let j = 0; j < m; j++) {
        const p = rise(d, m > 1 ? j / (m - 1) : 0);
        const key = p.toFixed(3) + up;
        if (cs[j].dataset.p === key) continue;
        cs[j].dataset.p = key;
        cs[j].style.opacity = p.toFixed(3);
        cs[j].style.transform = p >= 1 ? '' : `translate3d(0, ${((1 - p) * 72 * up).toFixed(1)}%, 0)`;
      }
      // then the lines of the description, one after another
      const ps = parts.current, k = ps.length;
      for (let j = 0; j < k; j++) {
        const p = rise(d, 0.25 + 0.75 * (k > 1 ? j / (k - 1) : 0));
        ps[j].style.opacity = p.toFixed(3);
        ps[j].style.transform = p >= 1 ? '' : `translate3d(0, ${((1 - p) * 16 * up).toFixed(1)}px, 0)`;
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

    const onResize = () => { layout(); measureBar(); w?.resize(); };
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
      setBar(false);
      sizes.disconnect();
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
    <>
    <section ref={act} className="pw" data-sc-act="pin" data-sc-span={span} data-sc-drift="#e3f2fb" aria-label="The work">
      <div data-sc-stage className="pw__stage">
        <canvas ref={canvas} className="pw__canvas" aria-hidden="true" />

        <header className="pw__head">
          <p className="lg-note hero__eyebrow lg-up"><i aria-hidden="true" />{n} projects</p>
          <h1 className="lg-display pw__title"><Chars text="The work" /></h1>
        </header>

        <span ref={lead} className="pw__lead" aria-hidden="true" />
        <span ref={dot} className="pw__dot" aria-hidden="true" />

        {/* One short line for screen readers when the project changes, instead of the whole label read out again. */}
        <p className="lg-sr" aria-live="polite" aria-atomic="true">{`Project ${active + 1} of ${n}: ${shortTitle(current.title)}`}</p>

        {/* The label: flat markup. The scroll moves it in and out with its globe; it changes only while out of sight. */}
        <div ref={label} className="pw__label">
          <p className="lg-note" data-part="">{[current.year, current.status].filter(Boolean).join(' · ')}</p>
          <h2 className="lg-display pw__name" data-long={shortTitle(current.title).length > 24 ? '' : undefined}><Letters text={shortTitle(current.title)} /></h2>
          <p className="pw__sum" data-part="">{current.summary}</p>
          <ul className="pw__stack" aria-label="Stack" data-part="">
            {current.technologies.slice(0, 5).map((t) => <li key={t} className="lg-chip">{t}</li>)}
          </ul>
          <div className="pw__links" data-part="">
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
    {/* the room's dark floor fading into the pale page, so the list is reached without a hard edge */}
    <div ref={after} className="pw__after" aria-hidden="true" />
    </>
  );
}
