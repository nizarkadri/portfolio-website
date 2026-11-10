"use client";
import Link from 'next/link';
import { Arrow, CTA_LABEL } from './Navbar';

/**
 * There is no mailing list yet, so this stays an honest note with the one site-wide ask.
 * The blog pages do not render it: the footer already carries "Your move." on those routes.
 */
export default function BlogNewsletter() {
  return (
    <section aria-label="New posts" className="bl-aside">
      <h2 className="lg-display lg-display--sm">New posts, occasionally.</h2>
      <p className="lg-body">Engineering notes on AI agents, architecture and mobile testing. There is no mailing list yet. If you want to talk about one of them, write to me.</p>
      <Link href="/contact" className="lg-cta">{CTA_LABEL} <Arrow /></Link>
    </section>
  );
}
