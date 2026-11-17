'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Planes at different depths: as the page scrolls past, each [data-depth] inside moves by that many pixels per
 * hundred scrolled (negative lags behind, reading as further away; positive runs ahead, reading as nearer), and
 * leans a little toward the pointer. The copy itself is never given a depth. Off under reduced motion.
 */
export default function Depth({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const planes = Array.from(el.querySelectorAll<HTMLElement>('[data-depth]')).map((p) => ({ p, d: Number(p.dataset.depth) || 0 }));
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let raf = 0, inView = true, mx = 0, my = 0, ex = 0, ey = 0;
    const frame = () => {
      raf = 0;
      if (!inView) return;
      raf = requestAnimationFrame(frame);
      const r = el.getBoundingClientRect();
      const y = -r.top;                                  // how far the block has scrolled up
      ex += (mx - ex) * 0.06; ey += (my - ey) * 0.06;
      planes.forEach(({ p, d }) => {
        p.style.transform = `translate3d(${(ex * d * 0.18).toFixed(2)}px, ${(y * d / 100 + ey * d * 0.12).toFixed(2)}px, 0)`;
      });
    };
    const onMove = (e: PointerEvent) => { if (fine) { mx = (e.clientX / window.innerWidth) * 2 - 1; my = (e.clientY / window.innerHeight) * 2 - 1; } };
    const seen = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView && !raf) raf = requestAnimationFrame(frame); });
    seen.observe(el);
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); seen.disconnect(); window.removeEventListener('pointermove', onMove); };
  }, []);

  return <div ref={root} className={className} {...rest}>{children}</div>;
}
