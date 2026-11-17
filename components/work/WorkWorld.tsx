'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PROJECT_PLACEHOLDER_IMAGE, ProjectSummary } from '../../app/lib/project-shared';
import { Arrow } from '../Navbar';
import { Chars } from '../Kinetic';
import type { Orrery } from './Orrery';
import { ease, paced as place } from '../pace';

const STEP = 1.25;        // viewport heights of scroll each project owns: room to watch one globe leave and the next arrive

/**
 * How far in a piece of the words is, 0 to 1, at distance d from its project: this page's own, slower version
 * of the pacing the site shares. Each piece takes longer to come and to go, and the pieces follow one another
 * over a longer stretch. `s` (0 to 1) is a piece's place in the order: the first arrives first and leaves first.
 */
const OUT = 0.47, TAKE = 0.27, HELD = 0.05, SPAN = OUT - TAKE - HELD;
const soft = (d: number, s: number) => ease((OUT - Math.abs(d) - (d < 0 ? s : 1 - s) * SPAN) / TAKE);

const shortTitle = (t: string) => t.split(/\s+[-—]\s+|:\s+/)[0];

/**
 * A name in two parts, to be set either side of its globe: split between words where the two parts come out
 * nearest the same length, or at the hyphen of a single word, where the globe then stands in for the hyphen.
 * One word with no hyphen stays whole.
 */
function halves(name: string): [string, string] {
  const words = name.split(' ');
  if (words.length < 2) {
    const at = name.indexOf('-');
    return at > 0 && at < name.length - 1 ? [name.slice(0, at), name.slice(at + 1)] : [name, ''];
  }
  let best = 1, gap = Infinity;
  for (let i = 1; i < words.length; i++) {
    const g = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (g < gap) { gap = g; best = i; }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}
/** How large a name can be set, from the longer of its two parts: a short one is set at poster size. */
const sizeOf = ([a, b]: [string, string]) => { const n = Math.max(a.length, b.length); return n <= 7 ? 'xl' : n <= 12 ? 'l' : n <= 17 ? 'm' : 's'; };

/** Words of single letters, so the scroll can raise them one at a time. Decoration: the name is read out from its hidden copy. */
function Glyphs({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, wi, all) => (
        <React.Fragment key={wi}>
          <span className="pw__w">
            {Array.from(word).map((ch, ci) => <span key={ci} className="pw__ch">{ch}</span>)}
          </span>
          {wi < all.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </>
  );
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
 * The work as an orrery you scroll through, in the site's own daylight. The scene is one WebGL canvas and
 * the words are ordinary markup, so they stay sharp and their links can always be clicked; but on a wide
 * window they are not set beside the scene, they are set in it. The globe on the podium sits in the middle
 * of its project's name; what the project is hangs under the first half of the name, where to go under the
 * second; which project of how many sits over the globe; and what it is built with rides the ring in the
 * floor, as the waiting globes do. Every one of them is placed each frame from where the scene itself is,
 * and moved by the same number that turns the ring, so all of it comes and goes as one thing.
 */
export default function WorkWorld({ projects }: { projects: ProjectSummary[] }) {
  const act = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<Orrery | null>(null);
  const label = useRef<HTMLDivElement>(null);
  const chars = useRef<HTMLElement[]>([]);
  const parts = useRef<HTMLElement[]>([]);
  // the pieces that are placed round the globe and along the ring, and the width of each pill of the stack
  const set = useRef<{ meta: HTMLElement | null; a: HTMLElement | null; b: HTMLElement | null; sum: HTMLElement | null; links: HTMLElement | null; built: HTMLElement | null; note: HTMLElement | null; pills: HTMLElement[]; widths: number[]; em: number }>(
    { meta: null, a: null, b: null, sum: null, links: null, built: null, note: null, pills: [], widths: [], em: 0 });
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

  // the letters and pieces of the words on show, found again whenever the project changes
  useLayoutEffect(() => {
    const el = label.current;
    if (!el) return;
    const q = (s: string) => el.querySelector<HTMLElement>(s);
    chars.current = Array.from(el.querySelectorAll<HTMLElement>('.pw__ch'));
    parts.current = Array.from(el.querySelectorAll<HTMLElement>('[data-part]'));
    chars.current.forEach((c) => { c.dataset.p = ''; });
    const pills = Array.from(el.querySelectorAll<HTMLElement>('.pw__stack li'));
    const a = q('.pw__half--a');
    set.current = { meta: q('.pw__meta'), a, b: q('.pw__half--b'), sum: q('.pw__sum'), links: q('.pw__links'), built: q('.pw__built'), note: q('.pw__built-label'), pills, widths: pills.map((p) => p.offsetWidth), em: a ? parseFloat(getComputedStyle(a).fontSize) || 0 : 0 };
  }, [active, mode]);

  useEffect(() => {
    if (mode !== 'live' || !canvas.current || !act.current) return;
    const el = act.current, cv = canvas.current;
    const mobile = window.matchMedia('(max-width: 860px)').matches;
    let dead = false, raf = 0, last = -1, w: Orrery | null = null, at0 = -1, then = performance.now();
    // On a wide window the words are set round the globe and along the ring ("orbit"). Anywhere narrower
    // they stay together at the foot of the scene, in the ordinary flow of the page.
    let orbit = false;
    const layout = () => {
      const was = orbit;
      orbit = window.innerWidth > 860 && window.innerWidth / window.innerHeight >= 1.25;
      el.classList.toggle('pw--float', orbit);
      const s = set.current;
      if (was && !orbit) {
        // back in the flow: nothing keeps the place the scene gave it
        [s.meta, s.a, s.b, s.sum, s.links, s.built, s.note, ...s.pills].forEach((x) => { if (x) { x.style.transform = ''; x.style.opacity = ''; x.style.filter = ''; } });
      }
      s.widths = s.pills.map((p) => p.offsetWidth);
      s.em = s.a ? parseFloat(getComputedStyle(s.a).fontSize) || 0 : 0;
    };
    layout();

    const at = (x: HTMLElement | null, px: number, py: number, tail: string, p = 1) => {
      if (!x) return;
      x.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) ${tail}`;
      x.style.opacity = p.toFixed(3);
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      // Where the scroll has got to, followed rather than obeyed: the place the page shows glides after it and
      // settles a moment later, so nothing starts or stops with the wheel. It is still one number for one frame:
      // the scene is drawn at this place now and the words are set from the same number, so they leave as their
      // globe leaves, arrive as the next one does, and change while they are out of sight.
      const to = place(-r.top / Math.max(1, r.height - window.innerHeight), n);
      const now = performance.now(), dt = Math.min(0.1, (now - then) / 1000);
      then = now;
      at0 = at0 < 0 || Math.abs(to - at0) < 0.0004 ? to : at0 + (to - at0) * (1 - Math.exp(-dt * 4.4));
      const f = at0;
      w?.draw(f);
      const here = Math.min(n - 1, Math.max(0, Math.round(f)));
      const d = f - here;
      const o = ease((OUT - Math.abs(d)) / 0.3);
      const up = d < 0 ? 1 : -1;   // arriving words come up from below, leaving words carry on upwards

      const lb = label.current;
      if (lb) {
        lb.style.opacity = (orbit && !w ? 0 : o).toFixed(3);
        // while the words are mostly out of sight, nothing in them can be clicked, tabbed to or read out
        const away = o <= 0.5;
        if (lb.inert !== away) lb.inert = away;
      }

      // the name, letter by letter
      const cs = chars.current, m = cs.length;
      for (let j = 0; j < m; j++) {
        const p = soft(d, m > 1 ? j / (m - 1) : 0);
        const key = p.toFixed(3) + up;
        if (cs[j].dataset.p === key) continue;
        cs[j].dataset.p = key;
        cs[j].style.opacity = p.toFixed(3);
        // each letter comes up from below and turns upright as it lands
        cs[j].style.transform = p >= 1 ? '' : `translate3d(0, ${((1 - p) * 82 * up).toFixed(1)}%, 0) rotate(${((1 - p) * 7 * up).toFixed(2)}deg)`;
      }

      if (orbit && w) {
        const s = set.current;
        const g = w.focusOnScreen();
        const lift = (order: number) => { const p = soft(d, order); return [p, (1 - p) * 22 * up] as const; };
        // The name is set either side of the globe, as if the globe were a letter of it: the first part ends
        // at its left, the second begins at its right. They draw apart a little as their globe leaves.
        // Every distance here is a share of the globe's own radius, so the spacing keeps its proportions at any size:
        // the name stands a third of a radius clear of the globe, and what hangs under it a fifth of a radius below.
        const gap = Math.max(30, g.r * 0.34), apart = (1 - o) * (1 - o) * 90;
        // out of focus as they go, as anything is that moves away from where you are looking
        const haze = o >= 0.999 ? '' : `blur(${((1 - o) * 7).toFixed(1)}px)`;
        if (s.a && s.a.style.filter !== haze) s.a.style.filter = haze;
        if (s.b && s.b.style.filter !== haze) s.b.style.filter = haze;
        // A letter does not fill its own box: the first part ends a hair short of its edge and the second starts
        // a little way in. Both are taken up here, so the two parts stand the same distance from the globe to the eye.
        const lx = g.x - g.r - gap - apart + s.em * 0.015, rx = g.x + g.r + gap + apart - s.em * 0.05, line = g.y - g.r * 0.16;
        at(s.a, lx, line, 'translate(-100%, -100%)');
        at(s.b, rx, line, 'translateY(-100%)');
        // what it is, under the first part; where to go, under the second; which of how many, over the globe
        const [pm, ym] = lift(0.1), [ps, ys] = lift(0.45), [pl, yl] = lift(0.7);
        at(s.meta, g.x, g.top - g.r * 0.24 + ym, 'translate(-50%, -100%)', pm);
        at(s.sum, lx, line + g.r * 0.2 + ys, 'translateX(-100%)', ps);
        at(s.links, rx, line + g.r * 0.2 + yl, '', pl);

        // What it is built with rides the ring in the floor, where the ring passes nearest you. Each pill
        // is given its place along the ring from its own width, so none overlaps another, and all of them
        // slide round the ring with the same turn that brings the globes round.
        if (s.built) { s.built.style.transform = ''; s.built.style.opacity = '1'; }
        const mid = w.orbitOnScreen(0, 0.885);   // between the ring of dots and the dashed line, where the floor is clear
        const [pn, yn] = lift(0.8);
        at(s.note, mid.x, mid.y + yn, 'translate(-50%, -50%)', pn);
        const k = s.pills.length, space = Math.max(8, g.r * 0.09);
        let total = -space;
        for (let i = 0; i < k; i++) total += (s.widths[i] || 0) + space;
        let x = w.orbitOnScreen(0).x - total / 2 + d * 460;
        for (let i = 0; i < k; i++) {
          const wide = s.widths[i] || 0, cx = x + wide / 2;
          x += wide + space;
          // the angle round the ring whose point lies under this place across the window
          let lo = -1.45, hi = 1.45;
          for (let it = 0; it < 14; it++) { const md = (lo + hi) / 2; if (w.orbitOnScreen(md).x < cx) lo = md; else hi = md; }
          const pt = w.orbitOnScreen((lo + hi) / 2);                      // it follows the ring's curve but stays level, as type should
          const p = soft(d, 0.4 + 0.6 * (k > 1 ? i / (k - 1) : 0));
          at(s.pills[i], pt.x, pt.y + (1 - p) * 10 * up, 'translate(-50%, -50%)', p);
        }
      } else if (!orbit) {
        if (lb) lb.style.transform = `translate3d(0, ${(-d * 34).toFixed(1)}px, 0)`;
        // the lines under the name, one after another
        const ps = parts.current, k = ps.length;
        for (let j = 0; j < k; j++) {
          const p = soft(d, 0.25 + 0.75 * (k > 1 ? j / (k - 1) : 0));
          ps[j].style.opacity = p.toFixed(3);
          ps[j].style.transform = p >= 1 ? '' : `translate3d(0, ${((1 - p) * 16 * up).toFixed(1)}px, 0)`;
        }
      }
      if (orbit && lb && lb.style.transform) lb.style.transform = '';
      if (here !== last) { last = here; setActive(here); }
    };

    import('./Orrery').then(({ Orrery }) => {
      if (dead) return;
      try {
        w = new Orrery(cv, {
          mobile,
          covers: projects.map((p) => (p.imageUrl === PROJECT_PLACEHOLDER_IMAGE ? '' : p.imageUrl)),
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

    const onResize = () => { layout(); w?.resize(); };
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
  const name = shortTitle(current.title);
  const two = halves(name);
  const span = (n * STEP + 1).toFixed(2);

  return (
    <section ref={act} className="pw" data-sc-act="pin" data-sc-span={span} data-sc-drift="#e3f2fb" aria-label="The work">
      <div data-sc-stage className="pw__stage">
        <canvas ref={canvas} className="pw__canvas" aria-hidden="true" />

        <header className="pw__head">
          <p className="lg-note hero__eyebrow lg-up"><i aria-hidden="true" />{n} projects</p>
          <h1 className="lg-display pw__title"><Chars text="The work" /></h1>
        </header>

        {/* One short line for screen readers when the project changes, instead of the whole label read out again. */}
        <p className="lg-sr" aria-live="polite" aria-atomic="true">{`Project ${active + 1} of ${n}: ${name}`}</p>

        {/* The words: flat markup, in reading order. On a wide window each piece is placed from the scene, frame by
            frame; on a narrow one they sit together at its foot. They change only while out of sight. */}
        <div ref={label} className="pw__label">
          <p className="lg-note pw__meta" data-part="">
            <b>{String(active + 1).padStart(2, '0')}</b>
            <span aria-hidden="true">/ {String(n).padStart(2, '0')}</span>
            {[current.year, current.status].filter(Boolean).map((m) => <span key={m} className="pw__meta-item">{m}</span>)}
          </p>
          <h2 className="lg-display pw__name" data-size={sizeOf(two)}>
            <span className="lg-sr">{name}</span>
            <span className="pw__half pw__half--a" aria-hidden="true"><Glyphs text={two[0]} /></span>
            {two[1] && <>{' '}<span className="pw__half pw__half--b" aria-hidden="true"><Glyphs text={two[1]} /></span></>}
          </h2>
          <p className="pw__sum" data-part="">{current.summary}</p>
          <div className="pw__built" data-part="">
            <p className="lg-note pw__built-label">Built with</p>
            <ul className="pw__stack" aria-label="Stack">
              {current.technologies.slice(0, 6).map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <div className="pw__links" data-part="">
            <Link href={`/projects/${current.slug}`} className="lg-cta lg-cta--sm">Case study <Arrow /></Link>
            {current.liveUrl && (
              <a href={current.liveUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Live preview of ${name} (opens in a new tab)`}>Live preview</a>
            )}
            {current.repoUrl && (
              <a href={current.repoUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Source code of ${name} (opens in a new tab)`}>Code</a>
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
