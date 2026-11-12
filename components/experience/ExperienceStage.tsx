'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Chars } from '../Kinetic';
import { KingMark } from '../Navbar';
import { webglOk } from '../marble/studio';
import type { PieceKind } from '../world/pieces';
import type { ExperienceWorld } from './ExperienceWorld';
import { CREEP, ease, HOLD, paced } from '../pace';
import { showFigure, type Result } from './results';

/** One part of the stack, as a piece: its chess name (san), what it stands for, a line about it, and its skills. */
export interface PieceGroup { piece: PieceKind; san: string; role: string; line: string; skills: string[] }
interface Role { company: string; position: string; location: string; technologies: string[]; achievements: string[] }

const PLACES = ['Experience', '', '', 'The stack', 'Credentials'];
const WALK_PER = 0.5;   // viewport heights of scroll for each result on the walk
const ARRIVE = [0, 0.06, 0.16, 0.06, 0];   // how far into each section the camera has arrived (see route in ExperienceWorld)

/** The line with its percentages set in ink. */
const emphasised = (line: string) =>
  line.split(/(\d+%)/g).map((part, i) => (/^\d+%$/.test(part) ? <strong key={i}>{part}</strong> : part));

/**
 * Experience as one world held behind the page: the camera glides through it with the scroll and never stops.
 * The page itself is ordinary sections in ordinary flow; each one is a place in the world, and what the world
 * shows there is what the words say: the first role's results stand up as columns along a runway, each carrying
 * its own words; the migration role's servers lift into the cloud as its figures count; the stack is five pieces
 * round a table that turns to each as its words are read; the credentials stand on the plain ground as it fades. Every result can also be read in full at
 * any moment from "All results". Without motion or WebGL the same sections stand without the world.
 */
export default function ExperienceStage({ results, roles, groups, credentials, skills }: {
  results: Result[]; roles: Role[]; groups: PieceGroup[]; credentials: React.ReactNode; skills: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labelEls = useRef<Array<HTMLDivElement | null>>([]);
  const countEls = useRef<HTMLElement[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const [live, setLive] = useState(true);
  const [place, setPlace] = useState(0);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !webglOk()) setLive(false);
  }, []);

  // the roles: the one with the migration has its own place; the rest walk the runway
  const migrateRole = roles.find((r) => r.achievements.some((a) => /migrat\w*[^.]*servers/i.test(a))) ?? null;
  const walkRoles = roles.filter((r) => r !== migrateRole);
  const walk = results.filter((r) => r.company !== migrateRole?.company);
  const moved = results.filter((r) => r.company === migrateRole?.company);
  const servers = Number((migrateRole?.achievements.join(' ').match(/(\d+)\+?\s+on-premise servers|over (\d+)/i) || [])[1] || (migrateRole?.achievements.join(' ').match(/over (\d+)/i) || [])[1] || 20);
  const names = [PLACES[0], walkRoles.map((r) => r.company).join(', ') || 'Results', migrateRole?.company || 'Migration', PLACES[3], PLACES[4]];

  const sections = useRef<HTMLElement[]>([]);
  const jump = useCallback((k: number) => {
    const el = sections.current.find((x) => Number(x.dataset.place) === k);
    if (!el) return;
    // land where the camera has arrived at the place, not where it is still flying in
    const y = el.getBoundingClientRect().top + window.scrollY + Math.max(2, ARRIVE[k] * el.offsetHeight);
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.4 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!live || !root.current || !canvas.current) return;
    const el = root.current, cv = canvas.current;
    sections.current = Array.from(el.querySelectorAll<HTMLElement>('[data-place]'));
    countEls.current = Array.from(el.querySelectorAll<HTMLElement>('[data-to]'));
    const mobile = window.matchMedia('(max-width: 860px)').matches;
    let world: ExperienceWorld | null = null, raf = 0, dead = false, inView = true, lastPlace = -1;

    // where the page is, as one number: a unit per section, from its top reaching the top of the window
    const where = () => {
      const y = window.scrollY, secs = sections.current;
      let s = 0;
      for (let k = 0; k < secs.length; k++) {
        const top = secs[k].getBoundingClientRect().top + y, h = secs[k].offsetHeight || 1;
        if (y >= top) s = Number(secs[k].dataset.place) + Math.min(1, (y - top) / h);
      }
      return s;
    };
    // the walk's words give way, each one as the next section's top edge comes up to it
    const after = sections.current[2] ?? null;
    let labelH: number[] = [], labelW: number[] = [];
    // the servers' move takes less of the page on a phone, where its sentences follow on a card of their own
    const moveFrom = mobile ? 2.04 : 2.08, moveSpan = mobile ? 0.44 : 0.74;

    // the stack: which piece is being read, as one number. Each piece's words are an ordinary block in the flow; as a
    // block's middle passes the reading line the table turns that piece round to the front, holding while it is read.
    const piecesSec = el.querySelector<HTMLElement>('.xw-pieces');
    const credSec = el.querySelector<HTMLElement>('.xw-cred');
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.xw-piece__card'));
    // on a phone the blocks stand in a row held under the table, and the scroll slides the row along with it
    const run = el.querySelector<HTMLElement>('.xw-pieces__run');
    const track = el.querySelector<HTMLElement>('.xw-pieces__list');
    let step = 0;
    const pickAt = () => {
      if (mobile && run && track) {
        const r = run.getBoundingClientRect();
        const p = -r.top / Math.max(1, r.height - window.innerHeight);
        const pick = paced(p, cards.length);
        // the row rests exactly on each card while it is read; the table keeps its slight creep
        const x = Math.min(1, Math.max(0, p)) * (cards.length - 1), i = Math.min(cards.length - 2, Math.floor(x));
        const rest = i + ease((x - i - HOLD) / (1 - 2 * HOLD));
        if (!step) { const li = track.children[0] as HTMLElement | undefined; step = li ? li.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0') : 0; }
        track.style.transform = `translate3d(${(-rest * step).toFixed(1)}px, 0, 0)`;
        return pick;
      }
      const line = window.innerHeight * 0.5;
      const mid = cards.map((c) => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; });
      if (!mid.length || mid[0] >= line) return 0;
      for (let i = 0; i < mid.length - 1; i++) {
        if (mid[i + 1] < line) continue;
        const k = (mid[i] - line) / (mid[i] - mid[i + 1]);
        return i + (1 - CREEP) * ease((k - HOLD) / (1 - 2 * HOLD)) + CREEP * k;
      }
      return mid.length - 1;
    };

    const frame = () => {
      raf = 0;
      if (!inView) return;
      raf = requestAnimationFrame(frame);
      const s = where();
      const vh = window.innerHeight;
      // the table leaves with its section: once the section's end comes up the window, the world goes up with it
      const lift = s > 3 && piecesSec ? Math.max(0, vh - piecesSec.getBoundingClientRect().bottom) : 0;
      // and the world steps back, leaving the credentials on the plain ground
      const credTop = credSec ? credSec.getBoundingClientRect().top : Infinity;
      const op = ease((credTop - 0.15 * vh) / (0.55 * vh));
      cv.style.opacity = op.toFixed(3);
      if (op > 0.001) world?.draw(s, pickAt(), lift);
      if (world) {
        const edge = after ? after.getBoundingClientRect().top : Infinity;
        if (!labelH.length) { labelH = labelEls.current.map((x) => x?.offsetHeight ?? 0); labelW = labelEls.current.map((x) => x?.offsetWidth ?? 0); }
        const W = window.innerWidth;
        world.walkAnchors.forEach((a, i) => {
          const lb = labelEls.current[i];
          if (!lb) return;
          // beside the column's shoulder; on a phone, over its top, kept inside the window
          const x = mobile ? Math.min(W - 16 - labelW[i], Math.max(16, a.x - labelW[i] / 2)) : a.x + 26;
          const y = mobile ? a.y - labelH[i] - 14 : a.y - 18;
          const on = a.on * Math.min(1, Math.max(0, (edge - (y + labelH[i]) - 24) / 160));
          lb.style.opacity = on.toFixed(3);
          lb.style.visibility = on > 0.01 ? 'visible' : 'hidden';
          lb.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        });
      }
      // the migration's figures count as its servers land
      const m = Math.min(1, Math.max(0, (s - moveFrom) / moveSpan));
      countEls.current.forEach((c) => {
        const v = String(Math.round(Number(c.dataset.to) * (m * m * (3 - 2 * m))));
        if (c.textContent !== v) c.textContent = v;
      });
      const p = Math.min(4, Math.floor(s + 0.02));
      if (p !== lastPlace) { lastPlace = p; setPlace(p); }
    };

    import('./ExperienceWorld').then(({ ExperienceWorld }) => {
      if (dead) return;
      try {
        world = new ExperienceWorld(cv, { walk: walk.map((r) => r.figures.map((f) => f.value)), servers, kinds: groups.map((g) => g.piece) }, mobile);
        world.moveFrom = moveFrom; world.moveSpan = moveSpan;
        world.start();
        el.classList.add('is-live');
      } catch { setLive(false); }
    });
    raf = requestAnimationFrame(frame);

    const seen = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting && !document.hidden;
      if (inView) { world?.start(); if (!raf) raf = requestAnimationFrame(frame); } else world?.stop();
    });
    seen.observe(el);
    const onResize = () => { world?.resize(); labelH = []; labelW = []; step = 0; };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      world?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      seen.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      world?.dispose();
    };
  // the world is built once for these results
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  const openAll = () => dialog.current?.showModal();
  const walkSpan = `${(walk.length * WALK_PER + 1).toFixed(2)} * 100svh`;

  return (
    <div ref={root} className={`xw${live ? '' : ' xw--still'}`}>
      {live && <canvas ref={canvas} className="xw__canvas" aria-hidden="true" />}

      {/* the words that ride the columns on the walk: each with its own result, never swapped */}
      {live && (
        <div className="xw__labels" aria-hidden="true">
          {walk.map((r, i) => (
            <div key={r.line} ref={(x) => { labelEls.current[i] = x; }} className="xw-label">
              <p className="xw-label__figs">
                {r.figures.length
                  ? r.figures.map((f) => <span key={f.label}><b>{showFigure(f)}</b><em>{f.label}</em></span>)
                  : <span><KingMark className="xw-mark" /><em>{r.tag}</em></span>}
              </p>
              <p className="xw-label__line">{emphasised(r.line)}</p>
            </div>
          ))}
        </div>
      )}

      {/* where you are, a way to any place, and every result in full at any moment: first in the reading order,
          fixed to the bottom of the window. Without the world the page already reads as the full list. */}
      {live && (
        <>
          <nav className="xw-index" aria-label="Places on this page">
            {names.map((nme, k) => (k === 2 && !migrateRole ? null : (
              <button key={k} type="button" aria-current={k === place ? 'true' : undefined} onClick={() => jump(k)}>
                <i aria-hidden="true" /><span>{nme}</span>
              </button>
            )))}
          </nav>
          <button type="button" className="xw-all" onClick={openAll}>All results</button>
        </>
      )}

      {/* the start */}
      <section data-place="0" className="xw-sec xw-intro" aria-labelledby="ae-experience-title">
        <div className="xw-intro__copy lg-wrap">
          <h1 id="ae-experience-title" className="lg-display xw-title"><Chars text={'The moves\nalready played.'} /></h1>
          <p className="lg-body lg-body--lg lg-up" style={{ ['--d' as string]: 600 }}>
            Where I have worked, what changed while I was there, and by how much. Every figure comes from the work itself.
          </p>
          <dl className="xw-roles lg-up" style={{ ['--d' as string]: 760 }}>
            {roles.map((r) => <div key={r.company}><dt>{r.company}</dt><dd className="lg-note">{r.position}</dd></div>)}
          </dl>
        </div>
      </section>

      {/* the walk: the first role's results, standing up along the runway */}
      <section data-place="1" className="xw-sec xw-walk" style={live ? { height: `calc(${walkSpan})` } : undefined} aria-label={names[1]}>
        {walkRoles.map((r) => (
          <header key={r.company} className="xw-walk__head lg-wrap">
            <h2 className="lg-display">{r.company}</h2>
            <p className="lg-note">{r.position} · {r.location}</p>
            <p className="xw-built"><span className="lg-note">Built with</span> {r.technologies.join(' · ')}</p>
          </header>
        ))}
        {/* without the world, and for screen readers, the same results as a list */}
        <ol className={live ? 'lg-sr' : 'xw-list lg-wrap'}>
          {walk.map((r) => (
            <li key={r.line}>
              <p className="xw-label__figs">{r.figures.length ? r.figures.map((f) => <span key={f.label}><b>{showFigure(f)}</b><em>{f.label}</em></span>) : <span><em>{r.tag}</em></span>}</p>
              <p className="xw-label__line">{emphasised(r.line)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* the migration */}
      {migrateRole && (
        <section data-place="2" className="xw-sec xw-move" aria-labelledby="xw-move-title">
          <div className="xw-move__copy lg-wrap">
            <h2 id="xw-move-title" className="lg-display">{migrateRole.company}</h2>
            <p className="lg-note">{migrateRole.position} · {migrateRole.location}</p>
            {moved.map((r, i) => (
              <div key={r.line} className={`xw-move__res${i ? ' xw-move__res--b' : ''}`}>
                <p className="xw-label__figs">
                  {r.figures.map((f) => (
                    <span key={f.label}><b>{f.sign}{live ? <i data-to={f.value}>0</i> : f.value}%</b><em>{f.label}</em></span>
                  ))}
                </p>
                <p className="xw-label__line xw-move__line">{emphasised(r.line)}</p>
              </div>
            ))}
            <p className="xw-built xw-move__line"><span className="lg-note">Built with</span> {migrateRole.technologies.join(' · ')}</p>
          </div>
          {/* on a phone the pinned copy keeps only the figures; the sentences come after, on their own card */}
          <div className="xw-move__more lg-wrap">
            {moved.map((r) => <p key={r.line} className="xw-label__line">{emphasised(r.line)}</p>)}
            <p className="xw-built"><span className="lg-note">Built with</span> {migrateRole.technologies.join(' · ')}</p>
          </div>
        </section>
      )}

      {/* the stack: five pieces round a table in the world; each one's words are a block in the flow, and reading
          down the blocks turns the table to bring that piece to the front */}
      <section data-place="3" className="xw-sec xw-pieces" aria-labelledby="xw-pieces-title">
        {live ? (
          <>
            <header className="xw-pieces__head lg-wrap">
              <h2 id="xw-pieces-title" className="lg-display">The pieces I play with.</h2>
              <p className="lg-body">One piece for each part of the stack, brought round as you go.</p>
            </header>
            <div className="xw-pieces__run"><div className="xw-pieces__stage"><ol className="xw-pieces__list lg-wrap">
              {groups.map((x) => (
                <li key={x.role} className="xw-piece">
                  <div className="xw-piece__card">
                    <p className="lg-note pp__kind"><span className="pp__san" aria-hidden="true">{x.san}</span> The {x.piece}</p>
                    <h3 className="lg-display pp__role">{x.role}</h3>
                    <p className="pp__line">{x.line}</p>
                    <ul className="pp__skills" aria-label={`${x.role} skills`}>
                      {x.skills.map((s) => <li key={s} className="lg-chip">{s}</li>)}
                    </ul>
                  </div>
                </li>
              ))}
            </ol></div></div>
          </>
        ) : skills}
      </section>

      {/* the credentials, over the world as it steps back */}
      <section data-place="4" className="xw-sec xw-cred" id="certificates">{credentials}</section>

      <dialog ref={dialog} className="xw-dialog" aria-labelledby="xw-all-title" data-lenis-prevent
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
        <div className="xw-dialog__bar">
          <h2 id="xw-all-title" className="lg-display">Every result</h2>
          <button type="button" className="ae-btn" onClick={() => dialog.current?.close()}>Close</button>
        </div>
        {roles.map((r) => (
          <div key={r.company} className="xw-dialog__role">
            <p className="xw-dialog__who"><strong>{r.company}</strong><span className="lg-note">{r.position} · {r.location}</span></p>
            <ol>
              {results.filter((x) => x.company === r.company).map((x) => (
                <li key={x.line}>
                  <p className="xw-dialog__figs">{x.figures.length ? x.figures.map((f) => <span key={f.label}><b>{showFigure(f)}</b> {f.label}</span>) : <span>{x.tag}</span>}</p>
                  <p>{emphasised(x.line)}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </dialog>
    </div>
  );
}
