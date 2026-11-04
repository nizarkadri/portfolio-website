"use client";
import { useState } from 'react';
export default function BlogShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const mark = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const copy = async () => { try { await navigator.clipboard.writeText(url); mark(); } catch { mark(); } };
  const share = async () => { try { await navigator.clipboard.writeText(`${title} — ${url}`); mark(); } catch { mark(); } };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={copy} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-[#B8E62D]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">{copied ? 'Copied ✓' : 'Copy link'}</button>
      <button onClick={share} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-[#B8E62D]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">Share</button>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-[#B8E62D]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">Post to X</a>
    </div>
  );
}
