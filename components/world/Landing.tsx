'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { World as WorldType } from './World';
import { Arrow, CTA_LABEL } from '../Navbar';
import { SOCIALS } from '../NewFooter';

export interface LandingDoor {
  slug: string;
  title: string;
  summary: string;
  technologies: string[];
  cover: string;
  liveUrl?: string;
}

interface Props {
  doors: LandingDoor[];
  tower: string[];
  projectCount: number;
  certificateCount: number;
}

/** The score of the game. `at` is where the camera rests; `from` is when the move is stamped. */
const MOVES = [
  { san: 'e4', label: 'Opening', fn: 'open()', from: 0, at: 0.04 },
  { san: 'Nf3', label: 'Calculation', fn: 'calculate()', from: 0.143, at: 0.19 },
  { san: 'Bc4', label: 'The work', fn: 'ship(3)', from: 0.293, at: 0.353 },
  { san: 'O-O', label: 'The city', fn: 'deploy("toronto")', from: 0.47, at: 0.523 },
  { san: 'd4', label: 'The tower', fn: 'prove()', from: 0.687, at: 0.767 },
  { san: 'Re1', label: 'Your move', fn: 'await yourMove()', from: 0.933, at: 1 },
];

const NAME = ['Nizar', 'Kadri'];
const LINE = ['I', 'think', 'several', 'moves', 'ahead.'];

const WINDOWS: Array<[number, number]> = [[0, 0.088], [0.138, 0.238], [0.288, 0.412], [0.465, 0.572], [0.682, 0.858], [0.93, 1.01]];

/** What each piece stands for. Order matches TAGGED in World.ts. */
const TAGS = [
  { piece: 'king', value: 'Nizar' },
  { piece: 'queen', value: 'React, TypeScript' },
  { piece: 'rook', value: 'Java, Spring Boot' },
  { piece: 'bishop', value: 'Python, LangChain' },
  { piece: 'knight', value: 'AWS, Azure' },
  { piece: 'pawn', value: 'Docker, CI/CD' },
];

/** Numbers that count up to what they are, once, when their waypoint arrives. */
function countUp(nodes: Array<HTMLElement | null>) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / 1100);
    const e = 1 - Math.pow(1 - k, 3);
    for (const n of nodes) if (n) n.textContent = String(Math.round(Number(n.dataset.to || 0) * e));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Landing({ doors, tower, projectCount, certificateCount }: Props) {
  const router = useRouter();
  const act = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  const counts = useRef<Array<HTMLElement | null>>([]);
  const world = useRef<WorldType | null>(null);
  const labels = useRef<Array<HTMLElement | null>>([]);
  const points = useRef<Array<HTMLElement | null>>([]);
  const scrims = useRef<Array<HTMLElement | null>>([]);
  const tags = useRef<Array<HTMLElement | null>>([]);
  const [move, setMove] = useState(0);
  const [mode, setMode] = useState<'pending' | 'live' | 'static'>('pending');
  const [reply, setReply] = useState(false);

  // Decide before the engine mounts whether this visitor gets the live world.
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMode(reduce || !webglOk() ? 'static' : 'live');
  }, []);

  useEffect(() => {
    if (mode !== 'live' || !canvas.current || !act.current) return;
    let dead = false;
    let raf = 0;
    let w: WorldType | null = null;
    const mobile = window.matchMedia('(max-width: 860px)').matches;
    const el = act.current;
    let last = -1;
    const letters = Array.from(name.current?.querySelectorAll<HTMLElement>('.hero__ch') ?? []);
    let px = -9999, py = -9999, pointerMoved = false, settle = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / travel));
      w?.setProgress(p);
      // the portrait holds while the name is read, then lets the world through
      if (plate.current) {
        const k = Math.min(1, Math.max(0, (p - 0.028) / 0.05));
        const o = 1 - k * k * (3 - 2 * k);
        plate.current.style.opacity = o.toFixed(3);
        plate.current.style.transform = `scale(${(1 + p * 0.9).toFixed(4)})`;
        plate.current.style.visibility = o < 0.004 ? 'hidden' : 'visible';
      }
      let m = 0;
      for (let i = 0; i < MOVES.length; i++) if (p >= MOVES[i].from - 0.004) m = i;
      if (m !== last) { last = m; setMove(m); }
      WINDOWS.forEach(([a, b], i) => {
        const node = points.current[i];
        if (!node) return;
        const on = p >= a - 0.01 && p <= b;
        node.inert = !on;
        if (on !== node.classList.contains('is-on')) {
          node.classList.toggle('is-on', on);
          if (on && i === 4) countUp(counts.current);
        }
      });
      // scrims follow the same windows as the copy they sit under
      for (const node of scrims.current) {
        if (!node) continue;
        const [a, b, greet, hold] = (node.dataset.win || '').split(' ').map(Number);
        const w = b - a;
        const ramp = Math.min(w * 0.3, 0.03);
        const up = greet ? (p >= a ? 1 : 0) : Math.min(1, Math.max(0, (p - a) / ramp));
        const down = hold ? 1 : Math.min(1, Math.max(0, (b - p) / ramp));
        node.style.opacity = (up * down).toFixed(3);
      }
      // stack labels ride above their pieces while the game position is on the board
      if (w) {
        const show = p < 0.247;
        tags.current.forEach((node, i) => {
          if (!node) return;
          const t = show ? w!.tag(i) : null;
          // keep labels off the copy: the right-hand column on desktop, the lower half on phones
          // the opening belongs to the portrait; the pieces are named once the camera is among them
          const opening = p < 0.12;
          const clear = t && t.y > 118 && !opening && (mobile ? t.y < window.innerHeight * 0.5 : t.x < window.innerWidth * 0.55);
          if (t && t.on && clear) {
            node.style.transform = `translate3d(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px, 0)`;
            node.style.opacity = '1';
          } else node.style.opacity = '0';
        });
      }
      // the name answers the pointer: letters near it take on weight
      if (!mobile && letters.length && p < 0.085 && (pointerMoved || settle > 0)) {
        settle = pointerMoved ? 30 : settle - 1;
        pointerMoved = false;
        for (const el of letters) {
          const r = el.getBoundingClientRect();
          const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
          el.style.fontWeight = String(Math.round(300 + 330 * Math.exp(-(d * d) / (150 * 150))));
        }
      }
      if (w && !mobile && p > 0.267 && p < 0.433) {
        labels.current.forEach((node, i) => {
          const s = w!.project(i);
          if (node && s) node.style.setProperty('--x', `${s.x.toFixed(1)}px`);
        });
      }
    };

    import('./World').then(({ World }) => {
      if (dead || !canvas.current) return;
      try {
        w = new World(canvas.current, {
          mobile,
          covers: doors.map((d) => d.cover),
          tower,
        });
      } catch {
        setMode('static');
        return;
      }
      world.current = w;
      (window as unknown as { __world?: WorldType }).__world = w;
      w.start();
      el.classList.add('is-live');
    });
    raf = requestAnimationFrame(frame);

    const onResize = () => w?.resize();
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY; pointerMoved = true;
      w?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    const onVis = () => (document.hidden ? w?.stop() : w?.start());
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVis);
      w?.dispose();
      world.current = null;
    };
  }, [mode, doors, tower]);

  const flyTo = useCallback((i: number) => {
    const el = act.current;
    if (!el) return;
    if (mode === 'static') {
      points.current[i]?.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (el.offsetHeight - window.innerHeight) * MOVES[i].at;
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }, [mode]);

  const play = useCallback(async (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (reply) return;
    setReply(true);
    try { sessionStorage.setItem('lg-reply', 'e5'); } catch { /* private mode */ }
    await Promise.race([world.current?.playReply() ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]);
    router.push('/contact');
  }, [reply, router]);

  const setPoint = (i: number) => (node: HTMLElement | null) => { points.current[i] = node; };
  const setScrim = (i: number) => (node: HTMLElement | null) => { scrims.current[i] = node; };

  return (
    <div className="world" data-mode={mode}>
      <section ref={act} className="world__act" data-sc-act="pin" data-sc-span="15" data-sc-drift="#e3f2fb" aria-label="The long game">
        <div data-sc-stage className="world__stage">
          <canvas ref={canvas} className="world__canvas" aria-hidden="true" />
          {/* the portrait opens the page and gives way to the board as the scroll begins */}
          <div ref={plate} className="hero-plate">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/portraits/nizar-hero.webp" alt="Nizar Kadri" fetchPriority="high" decoding="async" />
          </div>
          <div className="world__vignette" aria-hidden="true" />

          {/* 1. e4: the opening */}
          <div ref={setScrim(0)} className="scrim scrim--lead scrim--on" data-win="0.0 0.08 1 0" aria-hidden="true" />
          <div ref={setPoint(0)} className="wp wp--open" data-wp="open">
            <div className="wp__copy" data-sc-cue="0 0.08 0">
              <p className="lg-note hero__eyebrow"><i aria-hidden="true" />Software engineer, Toronto</p>
              <h1 ref={name} className="lg-display hero__name" aria-label="Nizar Kadri">
                {NAME.map((word, w) => (
                  <React.Fragment key={word}>
                    {w > 0 && ' '}
                    <span className="hero__word" aria-hidden="true">
                      {Array.from(word).map((ch, i) => (
                        <span key={i} className="hero__ch" style={{ '--i': w * 5 + i } as React.CSSProperties}>{ch}</span>
                      ))}
                    </span>
                  </React.Fragment>
                ))}
              </h1>
              <p className="lg-display lg-display--md hero__line" aria-label={LINE.join(' ')}>
                {LINE.map((word, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && ' '}
                    <span className="hero__w" aria-hidden="true" style={{ '--i': i } as React.CSSProperties}>{word}</span>
                  </React.Fragment>
                ))}
              </p>
              <p className="lg-body lg-body--lg">
                Chess player since childhood, engineer by trade, allergic to default settings. I read a system the way
                I read a board: every piece, every line, then one committed move.
              </p>
              <div className="wp__actions">
                <Link href="/contact" className="lg-cta">{CTA_LABEL} <Arrow /></Link>
                <Link href="/projects" className="lg-link">See the work</Link>
              </div>
            </div>
          </div>

          {/* 2. Nf3: calculation */}
          <div ref={setScrim(1)} className="scrim scrim--trail" data-win="0.143 0.233 0 0" aria-hidden="true" />
          <div ref={setPoint(1)} className="wp wp--calc" data-wp="calc">
            <div className="wp__copy" data-sc-cue="0.143 0.233">
              <p className="lg-note type" style={{ '--n': 23 } as React.CSSProperties}>search(position, <b>depth</b>)</p>
              <h2 className="lg-display lg-display--lg" data-sc-cue="0.143 0.233" data-sc-kinetic="words">Chess taught me to see the whole board.</h2>
              <p className="lg-body lg-body--lg">
                Every system is a position: pieces, pressure, and a few moves that actually matter. So I calculate the
                lines first. Then I commit. My default setting is that there has to be a better way.
              </p>
            </div>
          </div>

          {/* 3. Bc4: the work */}
          <div ref={setScrim(2)} className="scrim scrim--top" data-win="0.293 0.407 0 0" aria-hidden="true" />
          <div ref={setPoint(2)} className="wp wp--work" data-wp="work">
            <div className="wp__copy" data-sc-cue="0.293 0.407">
              <h2 className="lg-display lg-display--lg" data-sc-cue="0.293 0.407" data-sc-kinetic="words">Three doors. Each one shipped.</h2>
              <Link href="/projects" className="lg-link">All {projectCount} projects</Link>
            </div>
            <ol className="doors" data-sc-cue="0.293 0.407">
              {doors.map((d, i) => (
                <li key={d.slug} ref={(n) => { labels.current[i] = n; }} className="door">
                  <h3 className="lg-display lg-display--sm">
                    <Link href={`/projects/${d.slug}`}>{d.title}</Link>
                  </h3>
                  <p>{d.summary}</p>
                  <p className="lg-note">{d.technologies.slice(0, 3).join(' · ')}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* 4. O-O: the city */}
          <div ref={setScrim(3)} className="scrim scrim--lead" data-win="0.47 0.567 0 0" aria-hidden="true" />
          <div ref={setPoint(3)} className="wp wp--city" data-wp="city">
            <div className="wp__copy" data-sc-cue="0.47 0.567">
              <h2 className="lg-display lg-display--lg" data-sc-cue="0.47 0.567" data-sc-kinetic="words">Toronto is the home board.</h2>
              <dl className="ledger">
                <div>
                  <dt>CGI <span className="lg-note">Software Engineer</span></dt>
                  <dd>Re-architected Ontario&rsquo;s SEDAR Plus portal: pages 70% faster, 98% WCAG 2.1 compliant.</dd>
                </div>
                <div>
                  <dt>Fiera Capital <span className="lg-note">Cloud Administrator</span></dt>
                  <dd>Moved more than 20 on-premise servers to Azure and cut operating cost by 30%.</dd>
                </div>
              </dl>
              <Link href="/experience" className="lg-link">Full experience</Link>
            </div>
          </div>

          {/* 5. d4: the tower. The fog before it is authored silence. */}
          <div ref={setScrim(4)} className="scrim scrim--low" data-win="0.687 0.853 0 0" aria-hidden="true" />
          <div ref={setPoint(4)} className="wp wp--tower" data-wp="tower">
            <div className="wp__copy" data-sc-cue="0.687 0.853">
              <h2 className="lg-display lg-display--lg" data-sc-cue="0.687 0.853" data-sc-kinetic="words">Everything I have built and earned.</h2>
              <p className="lg-body lg-body--lg">
                <span className="count" ref={(n) => { counts.current[0] = n; }} data-to={projectCount}>{projectCount}</span> projects.{' '}
                <span className="count" ref={(n) => { counts.current[1] = n; }} data-to={certificateCount}>{certificateCount}</span> certifications. One long game.
              </p>
              <div className="wp__actions">
                <Link href="/experience#certificates" className="lg-link">The certificates</Link>
                <Link href="/projects" className="lg-link">The projects</Link>
              </div>
            </div>
          </div>

          {/* 6. the last position: it is the visitor's move */}
          <div ref={setScrim(5)} className="scrim scrim--close" data-win="0.933 1.3 0 1" aria-hidden="true" />
          <div ref={setPoint(5)} className="wp wp--close" data-wp="close">
            <div className="wp__copy" data-sc-cue="0.933 1.3 0.07 0">
              <p className="lg-note type" style={{ '--n': 16 } as React.CSSProperties}>await <b>yourMove()</b></p>
              <h2 className="lg-display lg-display--xl" data-sc-cue="0.933 1.3 0.07 0" data-sc-kinetic="chars">Your move.</h2>
              <p className="lg-body lg-body--lg">Six moves on the board and none answered yet. Tell me what you are building.</p>
              <Link href="/contact" className="lg-cta" onClick={play} data-sc-magnet="0.22">
                {reply ? 'e5. Good move.' : CTA_LABEL} <Arrow />
              </Link>
            </div>
            <footer className="world__foot" data-sc-cue="0.933 1.3 0.07 0" data-sc-rise="0">
              <span className="lg-note">Nizar Kadri · Toronto · {new Date().getFullYear()}</span>
              <nav aria-label="Elsewhere">
                <Link href="/about">About</Link>
                <Link href="/blog">Blog</Link>
                {SOCIALS.map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noreferrer noopener">{s.name}</a>
                ))}
              </nav>
            </footer>
          </div>

          {/* What the pieces stand for: his stack, labelled on the board itself. */}
          <ul className="tags" aria-label="The pieces I play with">
            {TAGS.map((t, i) => (
              <li key={t.piece} ref={(n) => { tags.current[i] = n; }} className="tag">
                <span><i>{t.piece}</i> = <b>{t.value}</b></span>
              </li>
            ))}
          </ul>

          {/* The scoresheet: written by scrolling, and the map of the page. */}
          <nav className="score" aria-label="The game so far">
            <p className="score__head lg-note"><span>{'// nizar'}</span><span>{'// you'}</span></p>
            <ol>
              {MOVES.map((m, i) => (
                <li key={m.san} className={i <= move ? 'is-played' : ''} aria-current={i === move ? 'step' : undefined}>
                  <button type="button" onClick={() => flyTo(i)} aria-label={`${i + 1}. ${m.san}, ${m.label}`}>
                    <span className="score__n">{i + 1}.</span>
                    <span className="score__san">{m.san}</span>
                    <span className="score__label" title={m.label}>{m.fn}</span>
                    <span className="score__black">{i === MOVES.length - 1 && reply ? 'e5' : '…'}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p key={move} className="score__now" aria-hidden="true"><b>{MOVES[move].san}</b> {MOVES[move].fn}</p>
          </nav>
        </div>
      </section>
    </div>
  );
}
