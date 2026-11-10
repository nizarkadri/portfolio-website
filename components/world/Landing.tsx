'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Arrow, CTA_LABEL } from '../Navbar';
import { SOCIALS } from '../NewFooter';
import { BEATS, LEGS, STILL_BEATS, TOTAL, beatOpacity, sceneAt, smooth, windowOf } from './flight';

export interface LandingDoor {
  slug: string;
  title: string;
  summary: string;
  technologies: string[];
  cover: string;
  liveUrl?: string;
}

export interface LandingCertificate {
  src: string;
  title: string;
}

interface Props {
  doors: LandingDoor[];
  certificates: LandingCertificate[];
  projectCount: number;
  certificateCount: number;
}

/** What each piece stands for, pinned to the piece in the opening frame.
 *  x and y are fractions of that frame (the top of each piece). */
const TAGS = [
  { piece: 'king', value: 'Nizar', x: 0.689, y: 0.31 },
  { piece: 'queen', value: 'React, TypeScript', x: 0.625, y: 0.395 },
  { piece: 'rook', value: 'Java, Spring Boot', x: 0.563, y: 0.465 },
  { piece: 'bishop', value: 'Python, LangChain', x: 0.786, y: 0.425 },
  { piece: 'knight', value: 'AWS, Azure', x: 0.858, y: 0.44 },
  { piece: 'pawn', value: 'Docker, CI/CD', x: 0.934, y: 0.485 },
];
const FRAME = 16 / 9;
const PHONE_FRAME = 9 / 16;

const LANES = 2;

export default function Landing({ doors, certificates, projectCount, certificateCount }: Props) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const scrims = useRef<Array<HTMLElement | null>>([]);
  const tags = useRef<Array<HTMLElement | null>>([]);
  const wall = useRef<HTMLDivElement>(null);
  const [move, setMove] = useState(0);
  const [still, setStill] = useState(false);
  const [phone, setPhone] = useState(false);
  const [reply, setReply] = useState(false);

  // Decide before the engine mounts which film this visitor gets.
  useLayoutEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const mq = window.matchMedia('(max-width: 860px)');
    setPhone(mq.matches);
    const on = () => setPhone(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const beats = still ? STILL_BEATS : BEATS;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
    let tone = '';
    const doc = document.documentElement;
    const blocks = Array.from(el.querySelectorAll<HTMLElement>('[data-beat]')).flatMap((node) => {
      const beat = beats.find((b) => b.key === node.dataset.beat);
      return beat ? [{ node, beat }] : [];
    });

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const vh = Math.max(1, window.innerHeight);
      const vw = window.innerWidth;
      const t = Math.min(TOTAL + 1, Math.max(0, -el.getBoundingClientRect().top / vh));

      // scrims follow the copy they sit under
      beats.forEach((b, i) => {
        const node = scrims.current[i];
        if (node) node.style.opacity = beatOpacity(b, t).toFixed(3);
      });

      // only the scene on screen can take focus; the rest are out of the tab order
      blocks.forEach(({ node, beat }) => {
        const off = beatOpacity(beat, t) < 0.5;
        if (node.inert !== off) node.inert = off;
      });

      // which move the score is on
      let m = 0;
      for (let i = 0; i < beats.length; i++) if (t >= beats[i].from - 0.02) m = i;
      if (m !== last) { last = m; setMove(m); }

      // the bar reads on marble while the film is in daylight
      const nextTone = t < sceneAt(1) + (still ? LEGS[1].w : 0.62) ? 'day' : 'night';
      if (nextTone !== tone) { tone = nextTone; doc.dataset.tone = tone; }

      // stack labels sit on the pieces while the opening position is on screen
      const show = 1 - smooth(t / 0.2);
      const ar = vw < 861 ? PHONE_FRAME : FRAME;
      const scale = Math.max(vw / ar, vh) ;
      const iw = scale * ar, ih = scale;
      const ox = (vw - iw) / 2, oy = (vh - ih) / 2;
      tags.current.forEach((node, i) => {
        if (!node) return;
        const x = ox + TAGS[i].x * iw, y = oy + TAGS[i].y * ih;
        const inside = x > 70 && x < vw - 70 && vw >= 861;
        node.style.opacity = inside ? show.toFixed(3) : '0';
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });

      // the certificates pass as the camera climbs
      if (wall.current) {
        const a = sceneAt(4), z = sceneAt(5);
        const u = still ? 0.5 : Math.min(1, Math.max(0, (t - a + 0.1) / (z - a + 0.2)));
        wall.current.style.setProperty('--u', u.toFixed(4));
      }
    };
    raf = requestAnimationFrame(frame);

    // The engine sizes the scroll track once, at mount. Re-measure when the
    // window and the fonts have settled.
    const relayout = () => window.dispatchEvent(new Event('resize'));
    window.addEventListener('load', relayout);
    document.fonts?.ready.then(relayout).catch(() => undefined);
    const settle = window.setTimeout(relayout, 600);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', relayout);
      window.clearTimeout(settle);
      delete doc.dataset.tone;
    };
  }, [beats, still]);

  const flyTo = useCallback((i: number) => {
    const el = root.current;
    if (!el) return;
    const b = beats[i];
    const rest = b.key === 'open' ? 0 : b.key === 'tower' ? b.from + 0.55 : b.key === 'close' ? TOTAL : still ? (b.from + b.to) / 2 : sceneAt(b.scene);
    const y = el.getBoundingClientRect().top + window.scrollY + rest * window.innerHeight;
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, still ? { immediate: true } : { duration: 1.8 });
    else window.scrollTo({ top: y, behavior: still ? 'auto' : 'smooth' });
  }, [beats, still]);

  const play = useCallback((e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (reply) return;
    setReply(true);
    try { sessionStorage.setItem('lg-reply', 'e5'); } catch { /* private mode */ }
    window.setTimeout(() => router.push('/contact'), still ? 0 : 900);
  }, [reply, router, still]);

  const setScrim = (i: number) => (node: HTMLElement | null) => { scrims.current[i] = node; };
  const win = (key: string) => windowOf(beats.find((b) => b.key === key)!);
  const poster = (n: number) => (phone ? `/world/k${n}-m.webp` : `/world/k${n}.webp`);
  const lanes = phone ? 2 : LANES;

  return (
    <div ref={root} className={`flight${still ? ' is-still' : ''}`} data-sc-mode="worldflight" data-sc-seam="0.17" data-sc-lerp="0.18">
      <div data-sc-world className="flight__world">
        {LEGS.map((leg, i) => (
          <div key={leg.id} data-sc-segment data-sc-w={leg.w} data-sc-waypoint={leg.label}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sc-world__poster" src={poster(Math.min(i, 6))} alt="" decoding="async" fetchPriority={i === 0 ? 'high' : 'low'} />
            <video data-sc-src={`/world/${leg.id}.mp4`} data-sc-src-mobile={`/world/${leg.id}-m.mp4`} muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
          </div>
        ))}
      </div>

      <div data-sc-world-copy className="flight__copy">
        {/* The scoresheet: written by scrolling, and the map of the page. It comes first
            in the layer so the keyboard reaches the map before any scene. */}
        <nav className="score" aria-label="The game so far">
          <p className="score__head lg-note"><span>{'// nizar'}</span><span>{'// you'}</span></p>
          <ol>
            {beats.map((b, i) => (
              <li key={b.san} className={i <= move ? 'is-played' : ''} aria-current={i === move ? 'step' : undefined}>
                <button type="button" onClick={() => flyTo(i)} aria-label={`${i + 1}. ${b.san}, ${b.label}`}>
                  <span className="score__n">{i + 1}.</span>
                  <span className="score__san">{b.san}</span>
                  <span className="score__label" title={b.label}>{b.fn}</span>
                  <span className={`score__black${i === beats.length - 1 && reply ? ' is-reply' : ''}`}>{i === beats.length - 1 && reply ? 'e5' : '…'}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        {/* scrims: only where the type sits, and driven here so the harness measures the real page */}
        {beats.map((b, i) => (
          <div key={b.key} ref={setScrim(i)} className={`veil veil--${b.key} veil--${b.tone}`} aria-hidden="true" />
        ))}

        {/* 1. e4: the opening */}
        <div className="slot slot--open">
        <section className="beat beat--open tone-day" data-sc-copy data-beat="open" data-sc-window={win('open')}>
          <p className="lg-note">Software engineer <b>/</b> Toronto</p>
          <h1 className="lg-display hero__name">Nizar Kadri</h1>
          <p className="lg-display lg-display--md hero__line">I think several moves ahead.</p>
          <p className="lg-body lg-body--lg">
            Chess player since childhood, engineer by trade, allergic to default settings. I read a system the way I
            read a board: every piece, every line, then one committed move.
          </p>
          <div className="beat__actions">
            <Link href="/contact" className="lg-cta">{CTA_LABEL} <Arrow /></Link>
            <Link href="/projects" className="lg-link">See the work</Link>
          </div>
          <ul className="legend" aria-label="The pieces I play with">
            {TAGS.slice(1).map((t) => (
              <li key={t.piece}><i>{t.piece}</i> {t.value}</li>
            ))}
          </ul>
        </section>
        </div>

        {/* 2. Nf3: calculation */}
        <div className="slot slot--calc">
        <section className="beat beat--calc tone-day" data-sc-copy data-beat="calc" data-sc-window={win('calc')}>
          <p className="lg-note">search(position, <b>depth</b>)</p>
          <h2 className="lg-display lg-display--lg">Chess taught me to see the whole board.</h2>
          <p className="lg-body lg-body--lg">
            Every system is a position: pieces, pressure, and a few moves that actually matter. So I calculate the
            lines first. Then I commit. My default setting is that there has to be a better way.
          </p>
        </section>
        </div>

        {/* 3. Bc4: the work */}
        <section className="slot slot--work" aria-label="Featured work">
          <header className="beat beat__head" data-sc-copy data-beat="work" data-sc-window={win('work')}>
            <h2 className="lg-display lg-display--lg">Three doors. Each one shipped.</h2>
            <Link href="/projects" className="lg-link">All {projectCount} projects</Link>
          </header>
          <ol className="gates" data-sc-copy data-beat="work" data-sc-window={win('work')}>
            {doors.map((d, i) => (
              <li key={d.slug} className="gate">
                <Link href={`/projects/${d.slug}`} className="gate__door" aria-label={`${d.title}, case study`}>
                  {d.cover && <Image src={d.cover} alt="" fill sizes="(max-width: 860px) 30vw, 22rem" priority={i === 0} />}
                </Link>
                <div className="gate__plate">
                  <h3 className="lg-display lg-display--sm"><Link href={`/projects/${d.slug}`}>{d.title}</Link></h3>
                  <p className="gate__sum">{d.summary}</p>
                  <p className="lg-note">{d.technologies.slice(0, 3).join(' · ')}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 4. O-O: where it was proven */}
        <div className="slot slot--city">
        <section className="beat beat--city" data-sc-copy data-beat="city" data-sc-window={win('city')}>
          <h2 className="lg-display lg-display--lg">Toronto is the home board.</h2>
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
        </section>
        </div>

        {/* 5. d4: the tower. The cloud before it is authored silence. */}
        <section className="slot slot--tower" aria-label="Certificates and work">
          <div className="beat beat--tower" data-sc-copy data-beat="tower" data-sc-window={win('tower')}>
            <h2 className="lg-display lg-display--lg">Everything I have built and earned.</h2>
            <p className="lg-body lg-body--lg">
              {projectCount} projects. {certificateCount} certifications. One long game.
            </p>
            <div className="beat__actions">
              <Link href="/about#certificates" className="lg-link">The certificates</Link>
              <Link href="/projects" className="lg-link">The projects</Link>
            </div>
          </div>
          <div ref={wall} className="wall" data-sc-copy data-beat="tower" data-sc-window={win('tower')} style={{ ['--lanes' as string]: lanes }}>
            {Array.from({ length: lanes }, (_, lane) => (
              <ul key={lane} className="wall__lane">
                {certificates.filter((_, i) => i % lanes === lane).map((c) => (
                  <li key={c.src}>
                    <Link href="/about#certificates" className="pane" aria-label={`Certificate: ${c.title}`}>
                      <Image src={c.src} alt="" width={420} height={300} sizes="(max-width: 860px) 40vw, 15rem" />
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        {/* 6. the last position: it is the visitor's move */}
        <section className="slot slot--close" aria-label="Your move">
          <div className="beat beat--close" data-sc-copy data-beat="close" data-sc-window={win('close')}>
            <p className="lg-note">await <b>yourMove()</b></p>
            <h2 className="lg-display lg-display--xl">Your move.</h2>
            <p className="lg-body lg-body--lg">Six moves on the board and none answered yet. Tell me what you are building.</p>
            <Link href="/contact" className="lg-cta" onClick={play} data-sc-magnet="0.22">
              {reply ? 'e5. Good move.' : CTA_LABEL} <Arrow />
            </Link>
          </div>
          <footer className="flight__foot" data-sc-copy data-beat="close" data-sc-window={win('close')}>
            <span className="lg-note">Nizar Kadri · Toronto · {new Date().getFullYear()}</span>
            <nav aria-label="Elsewhere">
              <Link href="/about">About</Link>
              <Link href="/blog">Blog</Link>
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer noopener">{s.name}</a>
              ))}
            </nav>
          </footer>
        </section>

        {/* What the pieces stand for: his stack, labelled on the board itself. */}
        <ul className="tags" aria-hidden="true">
          {TAGS.map((t, i) => (
            <li key={t.piece} ref={(n) => { tags.current[i] = n; }} className="tag">
              <span><i>{t.piece}</i> = <b>{t.value}</b></span>
            </li>
          ))}
        </ul>

      </div>

      <div data-sc-spacer aria-hidden="true" />
    </div>
  );
}
