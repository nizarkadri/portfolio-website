'use client';

import React, { useEffect, useRef } from 'react';
import type { PieceKind } from '../world/pieces';
import { webglOk } from './studio';
import type { Rider } from './Rider';

/**
 * A single marble piece on a clear canvas, set into the page like an object on a shelf. It turns with the
 * scroll (and a little toward the pointer), so it moves only when the reader does. Without WebGL or motion it
 * is simply absent; nothing on the page depends on it.
 */
export default function PieceCanvas({ kind, tone, className = '', turn = 0.0035, still = 0.5 }: {
  kind: PieceKind; tone: 'bone' | 'dark'; className?: string; turn?: number; still?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current, cv = canvas.current;
    if (!el || !cv || !webglOk()) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rider: Rider | null = null, raf = 0, inView = false, dead = false;
    let px = 0, ex = 0, lastY = window.scrollY, vel = 0;
    const frame = () => {
      raf = 0;
      if (!inView || !rider) return;
      raf = requestAnimationFrame(frame);
      const sy = window.scrollY;
      vel += (sy - lastY - vel) * 0.12; lastY = sy;
      ex += (px - ex) * 0.06;
      rider.draw(reduce ? still : still + sy * turn + ex * 0.5, reduce ? 0 : Math.max(-0.18, Math.min(0.18, vel * 0.005)));
    };
    const seen = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView && !raf) { lastY = window.scrollY; raf = requestAnimationFrame(frame); }
    }, { rootMargin: '15% 0px' });
    import('./Rider').then(({ Rider }) => {
      if (dead) return;
      try {
        rider = new Rider(cv, kind, tone);
        el.classList.add('is-on');
        seen.observe(el);
        rider.draw(still);
      } catch { /* the page stands without it */ }
    });
    const onPointer = (e: PointerEvent) => { if (e.pointerType === 'mouse') px = (e.clientX / window.innerWidth) * 2 - 1; };
    const onResize = () => rider?.resize();
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      seen.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      rider?.dispose();
    };
  }, [kind, tone, turn, still]);

  return (
    <div ref={box} className={`mk-piece ${className}`} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
