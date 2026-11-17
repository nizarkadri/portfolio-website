'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PROJECT_PLACEHOLDER_IMAGE, ProjectSummary } from '../../app/lib/project-shared';
import { Arrow } from '../Navbar';
import { Chars } from '../Kinetic';
import type { Orrery } from './Orrery';
import { ease, paced as place } from '../pace';

const STEP = 1.25;        // viewport heights of scroll each project owns: room to watch one globe leave and the next arrive
const DWELL = 0.7;        // and how many more the plan at the end is held for, so it is not scrolled past while it is being used

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
 *
 * After the last project there is one place more, and it is the page's index. The room opens into its own
 * plan: the view rises until it looks straight down on the ring, with every project standing round it, and
 * "Every project at a glance" is set either side of that ring exactly as a project's name was set either side
 * of its globe. Pick a globe (or step with the arrows) and it comes down on the podium in the middle and grows,
 * the ring slides aside, and what that project is appears beside it: when, what it is, what it runs on, and
 * where to go. The others stay on the ring to be picked next, so all of them can be skimmed from this one place.
 *
 * `fallback` is what the page shows instead where there is no scene at all (no WebGL, or reduced motion).
 */
export default function WorkWorld({ projects, fallback }: { projects: ProjectSummary[]; fallback?: React.ReactNode }) {
  const act = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<Orrery | null>(null);
  const label = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  const glance = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLParagraphElement>(null);
  const chars = useRef<HTMLElement[]>([]);
  const parts = useRef<HTMLElement[]>([]);
  // the pieces that are placed round the globe and along the ring, and the width of each pill of the stack
  const set = useRef<{ meta: HTMLElement | null; a: HTMLElement | null; b: HTMLElement | null; sum: HTMLElement | null; links: HTMLElement | null; built: HTMLElement | null; note: HTMLElement | null; pills: HTMLElement[]; widths: number[]; em: number }>(
    { meta: null, a: null, b: null, sum: null, links: null, built: null, note: null, pills: [], widths: [], em: 0 });
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState(-1);     // the project picked out of the plan, if any
  const [glanced, setGlanced] = useState(-1);   // the last one picked: its words stay while they fade
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
    // n projects, then the plan: n + 1 places. The plan is held a while longer; a jump to it lands part-way into that.
    const y = top + (el.offsetHeight - window.innerHeight * (1 + DWELL)) * (i / Math.max(1, n)) + (i >= n ? window.innerHeight * DWELL * 0.4 : 0);
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  }, [n]);

  /** Pick a project out of the plan, or none (-1). The scene decides; the page hears of it on the next frame. */
  const pick = useCallback((i: number) => { world.current?.select(i); }, []);

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
    let over: number | null = null, named = -1;   // the globe the pointer is on, and the one the tag was last written for
    let chosen = -1, gutter = 0;                  // the project picked out of the plan as the page last heard it; the page's side margin
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
      gutter = el.querySelector<HTMLElement>('.pw__head')?.offsetLeft ?? 24;
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
      const to = place(-r.top / Math.max(1, r.height - window.innerHeight * (1 + DWELL)), n + 1);
      const now = performance.now(), dt = Math.min(0.1, (now - then) / 1000);
      then = now;
      at0 = at0 < 0 || Math.abs(to - at0) < 0.0004 ? to : at0 + (to - at0) * (1 - Math.exp(-dt * 4.4));
      const f = at0;
      w?.draw(f);
      const here = Math.min(n, Math.max(0, Math.round(f)));
      const all = here === n;       // past the last project: the room has opened into its plan, and the words are its heading
      // That heading keeps out of the way until the view is nearly overhead, then arrives in the last third
      // of the passage: to the words, its place is further off than it is.
      const d = all ? Math.max(-0.5, (f - here) * 1.55) : f - here;

      // As the room opens, everything round the ring melts into the page's own ground, leaving the ring on it.
      const open = w ? w.opened : 0;
      // which project has been picked out of the plan, and how far the ring has slid aside for it
      const sel = w ? w.selected : -1, slid = w ? w.slid : 0;
      if (sel !== chosen) { chosen = sel; setPicked(sel); if (sel >= 0) setGlanced(sel); }
      const vl = veil.current;
      if (vl && w) {
        const v = ease(open / 0.75);
        if (v > 0) {
          const c = w.ringOnScreen();
          vl.style.setProperty('--vx', `${c.x.toFixed(1)}px`);
          vl.style.setProperty('--vy', `${c.y.toFixed(1)}px`);
          vl.style.setProperty('--vr', `${c.ring.toFixed(1)}px`);
        }
        vl.style.opacity = v.toFixed(3);
        // and the calm field the stage keeps behind the words stands down: the veil is that field now
        const pv = v.toFixed(2);
        if (el.style.getPropertyValue('--plan') !== pv) el.style.setProperty('--plan', pv);
      }
      // The scene's own controls stay with it: they go as soon as it starts to scroll away, and the way to the
      // plan is not offered once you are in it.
      const ft = foot.current;
      if (ft) {
        ft.style.opacity = ease(1 - (window.innerHeight - r.bottom) / (window.innerHeight * 0.1)).toFixed(3);
        const jump = ft.lastElementChild as HTMLElement | null;
        if (jump) { jump.style.opacity = (1 - ease(open / 0.6)).toFixed(3); jump.style.pointerEvents = open > 0.5 ? 'none' : ''; }
      }
      // In the plan a globe says which project it is when the pointer rests on it.
      const tg = tag.current;
      if (tg && w) {
        const spot = open > 0.9 && over !== null && over !== sel ? w.globeOnScreen(over) : null;
        if (spot && over !== null) {
          if (named !== over) {
            named = over;
            tg.firstElementChild!.textContent = String(over + 1).padStart(2, '0');
            tg.lastElementChild!.textContent = shortTitle(projects[over].title);
          }
          tg.style.transform = `translate3d(${spot.x.toFixed(1)}px, ${(spot.y - spot.r - 10).toFixed(1)}px, 0) translate(-50%, -100%)`;
          tg.style.opacity = '1';
        } else if (tg.style.opacity !== '0') tg.style.opacity = '0';
      }
      const o = ease((OUT - Math.abs(d)) / 0.3);
      const up = d < 0 ? 1 : -1;   // arriving words come up from below, leaving words carry on upwards

      const lb = label.current;
      // The plan's heading gives way to the picked project's words as the ring slides aside, and comes back after.
      const head = all ? 1 - ease(slid / 0.5) : 1;
      if (lb) {
        lb.style.opacity = (orbit && !w ? 0 : o * head).toFixed(3);
        // while the words are mostly out of sight, nothing in them can be clicked, tabbed to or read out
        const away = o * head <= 0.5;
        if (lb.inert !== away) lb.inert = away;
      }
      // What the picked project is: beside the ring on a wide window, where the ring has made room; at the foot
      // of the scene on a narrow one.
      const gl = glance.current;
      if (gl) {
        const show = w && all ? ease((slid - 0.4) / 0.55) * o : 0;
        gl.style.opacity = show.toFixed(3);
        const off = show <= 0.5;
        if (gl.inert !== off) gl.inert = off;
        if (orbit && w) {
          const g = w.ringOnScreen();
          const x = g.x + g.r + Math.max(36, g.r * 0.2);
          gl.style.transform = `translate3d(${x.toFixed(1)}px, ${g.y.toFixed(1)}px, 0) translateY(-50%)`;
          const wide = `${Math.round(Math.max(240, Math.min(580, window.innerWidth - x - gutter)))}px`;
          if (gl.style.width !== wide) gl.style.width = wide;
        } else if (gl.style.transform) { gl.style.transform = ''; gl.style.width = ''; }
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
        // What the words are set round: a project's globe; or, for the heading of the list, the whole ring from overhead.
        const g = all ? w.ringOnScreen() : w.focusOnScreen();
        const lift = (order: number) => { const p = soft(d, order); return [p, (1 - p) * 22 * up] as const; };
        // The name is set either side of the globe, as if the globe were a letter of it: the first part ends
        // at its left, the second begins at its right. They draw apart a little as their globe leaves.
        // Every distance here is a share of the globe's own radius, so the spacing keeps its proportions at any size:
        // the name stands a third of a radius clear of the globe, and what hangs under it a fifth of a radius below.
        const gap = all ? Math.max(26, g.r * 0.15) : Math.max(30, g.r * 0.34), apart = (1 - o) * (1 - o) * 90;
        // out of focus as they go, as anything is that moves away from where you are looking
        const haze = o >= 0.999 ? '' : `blur(${((1 - o) * 7).toFixed(1)}px)`;
        if (s.a && s.a.style.filter !== haze) s.a.style.filter = haze;
        if (s.b && s.b.style.filter !== haze) s.b.style.filter = haze;
        // A letter does not fill its own box: the first part ends a hair short of its edge and the second starts
        // a little way in. Both are taken up here, so the two parts stand the same distance from the globe to the eye.
        // Round the ring the heading and the line under it are centred on the ring's own middle, as a caption is.
        const lx = g.x - g.r - gap - apart + s.em * 0.015, rx = g.x + g.r + gap + apart - s.em * 0.05;
        const line = all ? g.y + s.em * 0.12 : g.y - g.r * 0.16, below = all ? Math.max(14, s.em * 0.36) : g.r * 0.2;
        at(s.a, lx, line, 'translate(-100%, -100%)');
        at(s.b, rx, line, 'translateY(-100%)');
        // what it is, under the first part; where to go, under the second; which of how many, over the globe
        const [pm, ym] = lift(0.1), [ps, ys] = lift(0.45), [pl, yl] = lift(0.7);
        at(s.meta, g.x, g.top - (all ? Math.max(14, g.r * 0.08) : g.r * 0.24) + ym, 'translate(-50%, -100%)', pm);
        at(s.sum, lx, line + below + ys, 'translateX(-100%)', ps);
        at(s.links, rx, line + below + yl, '', pl);

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
      over = w.pickAt(e.clientX, e.clientY);
      cv.style.cursor = over !== null ? 'pointer' : '';
    };
    const onClick = (e: MouseEvent) => {
      if (!w) return;
      const i = w.pickAt(e.clientX, e.clientY);
      if (i === null) return;
      // in the room a globe takes you to its project; in the plan it is picked out, where you are
      if (w.opened > 0.9) { if (i !== w.selected) w.select(i); } else walkTo(i);
    };
    // with a project picked out of the plan, the arrow keys step to the one before or after, and Escape puts it back
    const onKey = (e: KeyboardEvent) => {
      if (!w || w.opened < 0.9 || w.selected < 0 || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight') w.select((w.selected + 1) % n);
      else if (e.key === 'ArrowLeft') w.select((w.selected + n - 1) % n);
      else if (e.key === 'Escape') w.select(-1);
      else return;
      e.preventDefault();
    };
    const onVis = () => (document.hidden ? w?.stop() : w?.start());
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    cv.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      cv.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
      w?.dispose();
      world.current = null;
    };
  }, [mode, n, projects, walkTo]);

  // Without motion or WebGL there is no world to walk: the page opens on its heading and a plain list.
  if (mode === 'off') {
    return (
      <>
        <header className="pj-top lg-wrap pw-plain">
          <p className="lg-note hero__eyebrow"><i aria-hidden="true" />{n} projects</p>
          <h1 className="lg-display pj-title">The work</h1>
        </header>
        {fallback}
      </>
    );
  }

  // What the words are: a project; or, at the place after the last one, the heading of the plan.
  const current = active < n ? projects[active] : null;
  const name = current ? shortTitle(current.title) : 'Every project at a glance.';
  const two: [string, string] = current ? halves(name) : ['Every project', 'at a glance.'];
  const span = ((n + 1) * STEP + 1 + DWELL).toFixed(2);
  const seen = glanced >= 0 && glanced < n ? projects[glanced] : null;   // the project picked out of the plan
  const seenName = seen ? shortTitle(seen.title) : '';

  return (
    <section ref={act} className="pw" data-sc-act="pin" data-sc-span={span} data-sc-drift="#e3f2fb" aria-label="The work">
      <div data-sc-stage className="pw__stage">
        <canvas ref={canvas} className="pw__canvas" aria-hidden="true" />
        <div ref={veil} className="pw__veil" aria-hidden="true" />
        <p ref={tag} className="pw__tag" aria-hidden="true"><b /><span /></p>

        <header className="pw__head">
          <p className="lg-note hero__eyebrow lg-up"><i aria-hidden="true" />{n} projects</p>
          <h1 className="lg-display pw__title"><Chars text="The work" /></h1>
        </header>

        {/* One short line for screen readers when the project changes, instead of the whole label read out again. */}
        <p className="lg-sr" aria-live="polite" aria-atomic="true">{current ? `Project ${active + 1} of ${n}: ${name}` : picked >= 0 ? `Project ${picked + 1} of ${n}: ${seenName}` : `All ${n} projects at a glance.`}</p>

        {/* Every project as a plain link, for a screen reader or anything else that reads the page rather than the scene. */}
        <nav className="lg-sr" aria-label="All projects">
          <ul>
            {projects.map((p) => <li key={p.slug}><Link href={`/projects/${p.slug}`} tabIndex={-1}>{shortTitle(p.title)}</Link></li>)}
          </ul>
        </nav>

        {/* The words: flat markup, in reading order. On a wide window each piece is placed from the scene, frame by
            frame; on a narrow one they sit together at its foot. They change only while out of sight. */}
        <div ref={label} className="pw__label" data-all={current ? undefined : ''}>
          <p className="lg-note pw__meta" data-part="">
            {current ? (
              <>
                <b>{String(active + 1).padStart(2, '0')}</b>
                <span aria-hidden="true">/ {String(n).padStart(2, '0')}</span>
                {[current.year, current.status].filter(Boolean).map((m) => <span key={m} className="pw__meta-item">{m}</span>)}
              </>
            ) : (
              <>
                <b>01 &ndash; {String(n).padStart(2, '0')}</b>
                <span className="pw__meta-item">All at once</span>
              </>
            )}
          </p>
          <h2 className="lg-display pw__name" data-size={current ? sizeOf(two) : 'all'}>
            <span className="lg-sr">{name}</span>
            <span className="pw__half pw__half--a" aria-hidden="true"><Glyphs text={two[0]} /></span>
            {two[1] && <>{' '}<span className="pw__half pw__half--b" aria-hidden="true"><Glyphs text={two[1]} /></span></>}
          </h2>
          <p className="pw__sum" data-part="">{current ? current.summary : 'Pick any globe to see what it is, when, and what it runs on.'}</p>
          {current && (
            <div className="pw__built" data-part="">
              <p className="lg-note pw__built-label">Built with</p>
              <ul className="pw__stack" aria-label="Stack">
                {current.technologies.slice(0, 6).map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          )}
          <div className="pw__links" data-part="">
            {current ? (
              <>
                <Link href={`/projects/${current.slug}`} className="lg-cta lg-cta--sm">Case study <Arrow /></Link>
                {current.liveUrl && (
                  <a href={current.liveUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Live preview of ${name} (opens in a new tab)`}>Live preview</a>
                )}
                {current.repoUrl && (
                  <a href={current.repoUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Source code of ${name} (opens in a new tab)`}>Code</a>
                )}
              </>
            ) : (
              <button type="button" className="lg-cta lg-cta--sm" onClick={() => pick(0)}>Start with 01 <Arrow /></button>
            )}
          </div>
        </div>

        {/* What the picked project is: the same label the list used to give it. It changes with a click on another
            globe or a step with the arrows, and the ring beside it shows which one is out. */}
        <div ref={glance} className="pw__glance">
          {seen && (
            <>
              <div className="pw__glance-bar">
                <p className="lg-note pw__meta">
                  <b>{String(glanced + 1).padStart(2, '0')}</b>
                  <span aria-hidden="true">/ {String(n).padStart(2, '0')}</span>
                  {[seen.year, seen.status].filter(Boolean).map((m) => <span key={m} className="pw__meta-item">{m}</span>)}
                </p>
                <div className="pw__glance-nav">
                  <button type="button" aria-label="Previous project" onClick={() => pick((glanced + n - 1) % n)}><Arrow /></button>
                  <button type="button" aria-label="Next project" onClick={() => pick((glanced + 1) % n)}><Arrow /></button>
                  <button type="button" aria-label={`Back to all ${n}`} onClick={() => pick(-1)}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                  </button>
                </div>
              </div>
              <div className="pw__glance-text" key={seen.slug}>
                <h3 className="lg-display pw__glance-name lg-up">{seenName}</h3>
                <p className="pj-view__sum lg-up" style={{ ['--d' as string]: 70 }}>{seen.summary}</p>
                <ul className="pj-stack lg-up" style={{ ['--d' as string]: 140 }} aria-label="Stack">
                  {seen.technologies.slice(0, 6).map((t) => <li key={t} className="lg-chip">{t}</li>)}
                </ul>
                <div className="pj-links lg-up" style={{ ['--d' as string]: 210 }}>
                  <Link href={`/projects/${seen.slug}`} className="lg-cta lg-cta--sm">Case study <Arrow /></Link>
                  {seen.liveUrl && (
                    <a href={seen.liveUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Live preview of ${seenName} (opens in a new tab)`}>Live preview</a>
                  )}
                  {seen.repoUrl && (
                    <a href={seen.repoUrl} target="_blank" rel="noreferrer noopener" className="pj-pill" aria-label={`Source code of ${seenName} (opens in a new tab)`}>Code</a>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div ref={foot} className="pw__foot">
          <ol className="pw__rail" aria-label="Jump to a project">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <button type="button" aria-label={shortTitle(p.title)} aria-current={i === active ? 'true' : undefined} onClick={() => walkTo(i)} />
              </li>
            ))}
            <li className="pw__rail-all">
              <button type="button" aria-label="All of them at a glance" aria-current={active >= n ? 'true' : undefined} onClick={() => walkTo(n)} />
            </li>
          </ol>
          <button type="button" className="pj-pill" onClick={() => walkTo(n)}>All {n} at a glance</button>
        </div>
      </div>
    </section>
  );
}
