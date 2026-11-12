'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { lenisUtils } from '../SmoothScroll';
import type { Certificate } from './certificates';

/**
 * The certificates as two rows of frames drifting past in opposite directions, the way a gallery wall goes by
 * from a moving walkway. They drift slowly on their own, faster while the page is scrolled, and hold still under
 * the pointer or a focused frame. Every frame opens larger. Without motion the rows simply scroll sideways.
 */
export default function CertDrift({ certificates }: { certificates: Certificate[] }) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<Certificate | null>(null);
  const half = Math.ceil(certificates.length / 2);
  const rows = [certificates.slice(0, half), certificates.slice(half)];

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.add('is-drifting');
    const tracks = Array.from(el.querySelectorAll<HTMLElement>('[data-track]'));
    const held = tracks.map(() => false);
    const pos: number[] = tracks.map((_, i) => (i ? 0.5 : 0));
    let raf = 0, inView = false, last = performance.now(), lastY = window.scrollY, boost = 0;
    const frame = (now: number) => {
      raf = 0;
      if (!inView) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const sy = window.scrollY; boost += (Math.abs(sy - lastY) * 0.6 - boost) * 0.08; lastY = sy;
      tracks.forEach((t, i) => {
        // each track holds its row twice over, so half its width is one full loop
        const loop = t.scrollWidth / 2;
        if (!loop) return;
        const speed = held[i] ? 0 : (14 + boost * 2.2) * (i ? -1 : 1);
        pos[i] = (((pos[i] * loop + speed * dt) % loop) + loop) % loop / loop;
        t.style.transform = `translate3d(${(-pos[i] * loop).toFixed(1)}px, 0, 0)`;
      });
    };
    const seen = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } });
    seen.observe(el);
    const holds = tracks.map((t, i) => {
      const on = () => { held[i] = true; }, off = () => { held[i] = false; };
      t.addEventListener('pointerenter', on); t.addEventListener('pointerleave', off);
      t.addEventListener('focusin', on); t.addEventListener('focusout', off);
      return () => { t.removeEventListener('pointerenter', on); t.removeEventListener('pointerleave', off); t.removeEventListener('focusin', on); t.removeEventListener('focusout', off); };
    });
    return () => { cancelAnimationFrame(raf); seen.disconnect(); holds.forEach((h) => h()); };
  }, []);

  const open = useCallback((c: Certificate, from: HTMLElement) => { opener.current = from; setActive(c); }, []);
  useEffect(() => {
    const d = dialog.current;
    if (!d || !active) return;
    if (!d.open) d.showModal();
    lenisUtils.stop();
    return () => lenisUtils.start();
  }, [active]);
  const onClose = useCallback(() => { setActive(null); opener.current?.focus({ preventScroll: true }); }, []);
  const meta = (c: Certificate) => [c.issuer, c.date].filter(Boolean).join(', ');

  const frame = (c: Certificate, copy: boolean) => (
    <li key={(copy ? 'b-' : 'a-') + c.src} aria-hidden={copy || undefined}>
      <button type="button" className="cd-frame" tabIndex={copy ? -1 : undefined} aria-haspopup="dialog"
        aria-label={`${c.title}${meta(c) ? `, ${meta(c)}` : ''}. Open larger.`} onClick={(e) => open(c, e.currentTarget)}>
        <span className="cd-frame__mat"><Image src={c.src} alt="" fill sizes="(max-width: 720px) 70vw, 26vw" /></span>
        <span className="cd-frame__label"><b>{c.title}</b>{meta(c) && <small>{meta(c)}</small>}</span>
      </button>
    </li>
  );

  return (
    <>
      <div ref={root} className="cd">
        {rows.map((row, r) => (
          <div key={r} className="cd__row">
            <ul data-track="" className="cd__track" aria-label={r ? 'Certificates, second row' : 'Certificates'}>
              {row.map((c) => frame(c, false))}
              {row.map((c) => frame(c, true))}
            </ul>
          </div>
        ))}
      </div>

      <dialog ref={dialog} className="ae-lightbox" aria-labelledby="cd-lightbox-title" data-lenis-prevent onClose={onClose}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
        {active && (
          <>
            <div className="ae-lightbox__bar">
              <div>
                <h3 id="cd-lightbox-title" className="lg-display lg-display--sm">{active.title}</h3>
                {meta(active) && <p className="lg-note">{meta(active)}</p>}
              </div>
              <button type="button" className="ae-btn" autoFocus onClick={() => dialog.current?.close()}>Close</button>
            </div>
            <div className="ae-lightbox__img">
              <Image src={active.src} alt={`Certificate of completion: ${active.title}${meta(active) ? `, ${meta(active)}` : ''}`} fill sizes="(max-width: 1100px) 96vw, 1088px" />
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
