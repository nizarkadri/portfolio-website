'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Arrow, CTA_LABEL, KingMark } from './Navbar';

export const SOCIALS = [
  { name: 'GitHub', url: 'https://github.com/nizarkadri' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/nizarkadri' },
];

const NewFooter: React.FC = () => {
  const pathname = usePathname() || '/';
  // The landing page ends inside its own world; the contact page is the ask.
  if (pathname === '/') return null;
  const onContact = pathname.startsWith('/contact');

  return (
    <footer className="lg-foot">
      <div className="lg-wrap">
        {!onContact && (
          <div className="lg-foot__ask">
            <p className="lg-note">Black to play</p>
            <h2 className="lg-display lg-display--lg">Your move.</h2>
            <p className="lg-body">Tell me what you are building. I usually reply within a day.</p>
            <Link href="/contact" className="lg-cta">
              {CTA_LABEL} <Arrow />
            </Link>
          </div>
        )}
        <div className="lg-foot__base">
          <Link href="/" className="lg-bar__mark" aria-label="Nizar Kadri, home">
            <KingMark className="lg-bar__king" />
            <span>Nizar Kadri</span>
          </Link>
          <nav aria-label="Footer">
            <Link href="/projects">Work</Link>
            <Link href="/experience">Experience</Link>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer noopener">
                {s.name}
              </a>
            ))}
          </nav>
          <p className="lg-note">Toronto · {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
