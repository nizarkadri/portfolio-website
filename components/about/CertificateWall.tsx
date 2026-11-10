'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { lenisUtils } from '../SmoothScroll';
import type { Certificate } from './certificates';

interface Props {
  certificates: Certificate[];
  slots: number;
}

// Rows always fill the grid, whatever the count: no empty trailing cell.
const WIDE4 = [[4, 3, 3, 2], [2, 3, 3, 4], [3, 2, 4, 3], [3, 4, 2, 3]];
const WIDE3 = [[4, 4, 4], [5, 4, 3], [3, 4, 5]];
const MID2 = [[3, 3], [4, 2], [2, 4]];
const DRIFT = [0, 1.5, -0.5, 1, -0.75, 0.75, -1, 0.5, 0.75, -0.5, 0, 1.25, -0.5, 1, 0.25];

/** Split n frames into rows of `a` or `b` (a > b) with none left over where possible. */
function rows(n: number, a: number, b: number): number[] {
  const out: number[] = [];
  let left = n;
  while (left > 0) {
    if (left % a === 0 || left - a >= b) {
      // take a full row unless that would strand fewer than a short row
      const afterA = left - a;
      if (afterA === 0 || afterA >= b) {
        // prefer short rows when only they divide what is left
        if (left % a !== 0 && left % b === 0 && left <= a * b) { out.push(b); left -= b; continue; }
        out.push(a); left -= a; continue;
      }
    }
    if (left >= b) { out.push(b); left -= b; continue; }
    out.push(left); left = 0;
  }
  return out;
}

function spans(n: number, a: number, b: number, patternsA: number[][], patternsB: number[][], cols: number): number[] {
  const out: number[] = [];
  rows(n, a, b).forEach((size, r) => {
    const pattern = size === a ? patternsA[r % patternsA.length] : size === b ? patternsB[r % patternsB.length] : null;
    for (let i = 0; i < size; i++) out.push(pattern ? pattern[i] : Math.floor(cols / size));
  });
  return out;
}

/** A wall of framed slots. Frames with an image open larger; the rest are reserved. */
export default function CertificateWall({ certificates, slots }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<Certificate | null>(null);
  const reserved = Math.max(0, slots - certificates.length);
  const total = certificates.length + reserved;
  const layout = useMemo(() => {
    const wide = spans(total, 4, 3, WIDE4, WIDE3, 12);
    const mid = spans(total, 3, 2, [[2, 2, 2]], MID2, 6);
    return Array.from({ length: total }, (_, i) => ({
      '--s-wide': wide[i],
      '--s-mid': mid[i],
      '--s-narrow': total % 2 === 1 && i === 0 ? 2 : 1,
      '--dy': `${DRIFT[i % DRIFT.length]}rem`,
    }) as CSSProperties);
  }, [total]);

  const open = useCallback((c: Certificate, from: HTMLElement) => {
    opener.current = from;
    setActive(c);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d || !active) return;
    if (!d.open) d.showModal();
    lenisUtils.stop();
    return () => lenisUtils.start();
  }, [active]);

  // Fires for the close button, a backdrop click and Esc alike.
  const onClose = useCallback(() => {
    setActive(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

  const meta = (c: Certificate) => [c.issuer, c.date].filter(Boolean).join(', ');

  return (
    <>
      <ol className="ae-wall" data-sc-in data-sc-stagger="40">
        {certificates.map((c, i) => (
          <li key={c.src} style={layout[i]}>
            <button
              type="button"
              className="ae-frame"
              data-sc-tilt="6"
              aria-haspopup="dialog"
              aria-label={`${c.title}${meta(c) ? `, ${meta(c)}` : ''}. Open larger.`}
              onClick={(e) => open(c, e.currentTarget)}
            >
              <span className="ae-frame__mat">
                <Image src={c.src} alt="" fill sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 34vw" />
              </span>
              <span className="ae-frame__label">{c.title}</span>
            </button>
          </li>
        ))}
        {Array.from({ length: reserved }, (_, i) => (
          <li key={`reserved-${i}`} style={layout[certificates.length + i]}>
            <div className="ae-frame ae-frame--reserved" data-sc-tilt="5">
              <span className="ae-frame__mat">
                <span className="lg-note">Reserved</span>
              </span>
            </div>
          </li>
        ))}
      </ol>

      <dialog
        ref={dialog}
        className="ae-lightbox"
        aria-labelledby="ae-lightbox-title"
        data-lenis-prevent
        onClose={onClose}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        {active && (
          <>
            <div className="ae-lightbox__bar">
              <div>
                <h3 id="ae-lightbox-title" className="lg-display lg-display--sm">{active.title}</h3>
                {meta(active) && <p className="lg-note">{meta(active)}</p>}
              </div>
              <button type="button" className="ae-btn" autoFocus onClick={() => dialog.current?.close()}>
                Close
              </button>
            </div>
            <div className="ae-lightbox__img">
              <Image
                src={active.src}
                alt={`Certificate of completion: ${active.title}${meta(active) ? `, ${meta(active)}` : ''}`}
                fill
                sizes="(max-width: 1100px) 96vw, 1088px"
              />
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
