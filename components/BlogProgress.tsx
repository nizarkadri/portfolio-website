"use client";
import { useEffect, useRef } from 'react';

/** A hairline under the bar that fills as the article is read. Transform only. */
export default function BlogProgress({ target }: { target: string }) {
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = document.getElementById(target);
    if (!el || !bar.current) return;
    const fill = bar.current;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const start = window.innerHeight * 0.25;
      const travel = Math.max(1, r.height - window.innerHeight * 0.5);
      const p = Math.min(1, Math.max(0, (start - r.top) / travel));
      fill.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target]);

  return <div className="bl-progress" aria-hidden="true"><i ref={bar} /></div>;
}
