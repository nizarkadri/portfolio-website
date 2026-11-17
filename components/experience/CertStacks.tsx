'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { lenisUtils } from '../SmoothScroll';
import type { Certificate } from '../about/certificates';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const SHOW = 4;   // titles written out under a stack; the rest are a tap away in the viewer
/** How the cards behind the top one lie once the stack has fanned: across (%), up (%), turned (deg). */
const LIE = [[0, 0, 0], [7, -2.5, 4.5], [-6, -1.5, -3.5], [13, -4.5, 8.5]];

interface Stack { name: string; items: Certificate[]; years: string }

/** A date such as "Feb 2025" as a number that sorts; undated sorts last. */
const when = (d?: string) => {
  const m = d?.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/i);
  if (m) return Number(m[2]) * 12 + Math.max(0, MONTHS.indexOf(m[1].toLowerCase()));
  const y = d?.match(/\d{4}/);
  return y ? Number(y[0]) * 12 : -1;
};
const short = (issuer: string) => (issuer.split(' ').length > 2 ? issuer.split(' ')[0] : issuer);
const listed = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** The certificates gathered by where they were earned, newest first; issuers with one certificate share a last stack. */
function stacksOf(certs: Certificate[]): Stack[] {
  const by = new Map<string, Certificate[]>();
  certs.forEach((c) => { const k = c.issuer || 'Elsewhere'; by.set(k, [...(by.get(k) ?? []), c]); });
  const newest = (xs: Certificate[]) => [...xs].sort((a, b) => when(b.date) - when(a.date));
  const years = (xs: Certificate[]) => {
    const ys = xs.map((c) => c.date?.match(/\d{4}/)?.[0]).filter(Boolean).map(Number);
    if (!ys.length) return '';
    const lo = Math.min(...ys), hi = Math.max(...ys);
    return lo === hi ? String(hi) : `${lo} to ${hi}`;
  };
  const many: Stack[] = [], singles: Certificate[] = [];
  by.forEach((xs, k) => { if (xs.length > 1) many.push({ name: k, items: newest(xs), years: years(xs) }); else singles.push(xs[0]); });
  many.sort((a, b) => when(b.items[0].date) - when(a.items[0].date));
  if (singles.length) {
    const items = newest(singles);
    many.push({ name: listed(items.map((c) => short(c.issuer || 'Elsewhere'))), items, years: years(items) });
  }
  return many;
}

/**
 * The certificates as a few stacks on the table, one for each place they were earned. As the stacks come up the
 * window their cards fan out from a neat pile, the newest on top; under each, its name, its years and its first few
 * titles. A stack, or any title, opens a viewer that goes through that stack one certificate at a time (arrow keys
 * too). Without motion the stacks lie already fanned.
 */
export default function CertStacks({ certificates }: { certificates: Certificate[] }) {
  const stacks = useMemo(() => stacksOf(certificates), [certificates]);
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [at, setAt] = useState<{ s: number; i: number } | null>(null);

  // the fan: each stack's cards spread as it comes up the window, a little after the one before it
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const piles = Array.from(el.querySelectorAll<HTMLElement>('[data-stack]'));
    const last = piles.map(() => -1);
    let raf = 0, inView = false;
    const frame = () => {
      raf = 0;
      if (!inView) return;
      raf = requestAnimationFrame(frame);
      const vh = window.innerHeight;
      piles.forEach((p, i) => {
        const k = Math.min(1, Math.max(0, (vh * 0.96 - p.getBoundingClientRect().top) / (vh * 0.5) - i * 0.14));
        const fan = Math.round(k * k * (3 - 2 * k) * 1000) / 1000;
        if (fan !== last[i]) { last[i] = fan; p.style.setProperty('--fan', String(fan)); }
      });
    };
    const seen = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView && !raf) raf = requestAnimationFrame(frame); }, { rootMargin: '20% 0px' });
    seen.observe(el);
    return () => { cancelAnimationFrame(raf); seen.disconnect(); };
  }, []);

  const open = useCallback((s: number, i: number, from: HTMLElement) => { opener.current = from; setAt({ s, i }); }, []);
  const step = useCallback((d: number) => setAt((a) => (a ? { s: a.s, i: (a.i + d + stacks[a.s].items.length) % stacks[a.s].items.length } : a)), [stacks]);
  useEffect(() => {
    const d = dialog.current;
    if (!d || !at) return;
    if (!d.open) d.showModal();
    lenisUtils.stop();
    return () => lenisUtils.start();
  }, [at]);
  const onClose = useCallback(() => { setAt(null); opener.current?.focus({ preventScroll: true }); }, []);
  const meta = (c: Certificate) => [c.issuer, c.date].filter(Boolean).join(', ');
  const active = at ? stacks[at.s].items[at.i] : null;
  const total = at ? stacks[at.s].items.length : 0;

  return (
    <div ref={root} className="cs">
      <ul className="cs__stacks lg-wrap">
        {stacks.map((st, si) => {
          const n = st.items.length;
          return (
            <li key={st.name} className="cs-stack">
              <button type="button" className="cs-stack__pile" data-stack="" aria-haspopup="dialog"
                aria-label={`${st.name}: ${n} certificate${n > 1 ? 's' : ''}. Open to go through ${n > 1 ? 'them' : 'it'}.`}
                onClick={(e) => open(si, 0, e.currentTarget)}>
                {st.items.slice(0, LIE.length).map((c, j) => (
                  <span key={c.src} className="cs-card" data-j={j} aria-hidden="true"
                    style={{ ['--j' as string]: j, ['--x' as string]: LIE[j][0], ['--y' as string]: LIE[j][1], ['--r' as string]: LIE[j][2] }}>
                    <span className="cs-card__in">
                      <span className="cs-card__mat"><Image src={c.src} alt="" fill sizes="(max-width: 860px) 80vw, 26vw" /></span>
                    </span>
                  </span>
                ))}
                {n > 1 && <span className="cs-stack__count" aria-hidden="true">{n}</span>}
              </button>
              <div className="cs-stack__text">
                <h3 className="cs-stack__name">{st.name}</h3>
                <p className="lg-note">{n} certificate{n > 1 ? 's' : ''}{st.years ? ` · ${st.years}` : ''}</p>
                <ol className="cs-stack__titles">
                  {st.items.slice(0, SHOW).map((c, j) => (
                    <li key={c.src}><button type="button" aria-haspopup="dialog" onClick={(e) => open(si, j, e.currentTarget)}>{c.title}</button></li>
                  ))}
                  {n > SHOW && (
                    <li><button type="button" className="cs-more" aria-haspopup="dialog" onClick={(e) => open(si, SHOW, e.currentTarget)}>and {n - SHOW} more</button></li>
                  )}
                </ol>
              </div>
            </li>
          );
        })}
      </ul>

      <dialog ref={dialog} className="ae-lightbox cs-view" aria-labelledby="cs-view-title" data-lenis-prevent onClose={onClose}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } }}>
        {active && at && (
          <>
            <div className="ae-lightbox__bar">
              <div>
                <h3 id="cs-view-title" className="lg-display lg-display--sm">{active.title}</h3>
                <p className="lg-note">{[meta(active), total > 1 ? `${at.i + 1} of ${total}` : ''].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="cs-view__nav">
                {total > 1 && (
                  <>
                    <button type="button" className="ae-btn" onClick={() => step(-1)} aria-label="Previous certificate">←</button>
                    <button type="button" className="ae-btn" onClick={() => step(1)} aria-label="Next certificate">→</button>
                  </>
                )}
                <button type="button" className="ae-btn" autoFocus onClick={() => dialog.current?.close()}>Close</button>
              </div>
            </div>
            <div className="ae-lightbox__img">
              <Image key={active.src} src={active.src} alt={`Certificate of completion: ${active.title}${meta(active) ? `, ${meta(active)}` : ''}`} fill sizes="(max-width: 1100px) 96vw, 1088px" />
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
