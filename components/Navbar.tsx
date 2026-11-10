'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const CTA_LABEL = 'Make your move';

const LINKS = [
  { href: '/projects', label: 'Work' },
  { href: '/experience', label: 'Experience' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
];

/** The king, drawn once and used as the mark everywhere. */
export const KingMark = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M11.1 1.5h1.8v1.9h1.9v1.8h-1.9v1.5c1.9.5 3.2 2 3.2 3.9 0 1.5-.8 2.8-2.1 3.7l1.7 4.6H8.3l1.7-4.6c-1.3-.9-2.1-2.2-2.1-3.7 0-1.9 1.3-3.4 3.2-3.9V5.2H9.2V3.4h1.9V1.5z" />
    <path d="M6.2 20.1h11.6l.9 2.4H5.3l.9-2.4z" />
  </svg>
);

export const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Navbar: React.FC = () => {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('lg-menu-open', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className={`lg-bar${scrolled && !isHome ? ' is-solid' : ''}${isHome ? ' is-home' : ''}${open ? ' is-open' : ''}`}>
      <div className="lg-bar__inner">
        <Link href="/" className="lg-bar__mark" aria-label="Nizar Kadri, home">
          <KingMark className="lg-bar__king" />
          <span>Nizar Kadri</span>
        </Link>

        <nav className="lg-bar__links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={active(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="lg-bar__end">
          <Link href="/contact" className="lg-cta lg-cta--sm lg-bar__cta">
            {CTA_LABEL}
          </Link>
          <button
            type="button"
            className="lg-bar__toggle"
            aria-expanded={open}
            aria-controls="lg-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="lg-menu" className="lg-menu" hidden={!open}>
        <nav aria-label="Mobile">
          {[{ href: '/', label: 'Home' }, ...LINKS].map((l, i) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>
              <span className="lg-note">{i + 1}.</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/contact" className="lg-cta">
          {CTA_LABEL} <Arrow />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
