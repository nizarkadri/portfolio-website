"use client";
import Link from 'next/link';
export default function BlogNewsletter() {
  return (
    <section aria-label="Newsletter" className="rounded-3xl border border-white/10 bg-[#0B0B0F]/95 p-8 md:p-10">
      <h2 className="text-2xl font-bold text-white">New posts, occasionally.</h2>
      <p className="mt-2 max-w-xl leading-7 text-soft-white/65">Engineering notes on AI agents, architecture, and mobile testing — no spam, unsubscribe anytime. Prefer email? Reach me via the contact page.</p>
      <Link href="/contact" className="mt-6 inline-block rounded-full bg-[#B8E62D] px-6 py-3 font-semibold text-black transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Get in touch →</Link>
    </section>
  );
}
