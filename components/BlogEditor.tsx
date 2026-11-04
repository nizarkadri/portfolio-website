"use client";
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { newPostSchema, estimateReadingTime } from '../app/lib/blog-shared';

// Minimal hand-rolled preview (headings/bold/italic/lists/code) — author's own draft, rendered as React nodes.
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    return <span key={i}>{p}</span>;
  });
}
function Preview({ md }: { md: string }) {
  const blocks = useMemo(() => md.split(/\n{2,}/), [md]);
  return (
    <div className="prose prose-invert max-w-none">
      {blocks.map((b, i) => {
        if (b.startsWith('# ')) return <h1 key={i}>{renderInline(b.slice(2))}</h1>;
        if (b.startsWith('## ')) return <h2 key={i}>{renderInline(b.slice(3))}</h2>;
        if (b.startsWith('### ')) return <h3 key={i}>{renderInline(b.slice(4))}</h3>;
        if (b.startsWith('```')) return <pre key={i}><code>{b.replace(/```/g, '')}</code></pre>;
        if (/^(- |\d+\. )/.test(b)) return <ul key={i}>{b.split('\n').map((l, j) => <li key={j}>{renderInline(l.replace(/^(- |\d+\. )/, ''))}</li>)}</ul>;
        return <p key={i}>{renderInline(b)}</p>;
      })}
    </div>
  );
}

const DRAFT_KEY = 'blog-draft-v1';
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled-post';

export default function BlogEditor() {
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().slice(0, 10), slug: '', excerpt: '', tags: '', author: 'Nizar Kadri', featured: false, content: '' });
  const [status, setStatus] = useState('');
  useEffect(() => { const raw = localStorage.getItem(DRAFT_KEY); if (raw) { try { setForm(JSON.parse(raw)); } catch { /* corrupted draft ignored */ } } }, []);
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* storage full/unavailable — draft kept in memory */ } }, [form]);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
  const slug = form.slug || slugify(form.title);
  const fileName = `${slug}.md`;
  const markdown = useMemo(() => {
    const fm = ['---', `title: "${form.title.replace(/"/g, '\\"')}"`, `date: ${form.date}`, `slug: ${slug}`,
      `excerpt: "${form.excerpt.replace(/"/g, '\\"')}"`, `tags: [${form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => `'${t}'`).join(', ')}]`,
      `author: ${form.author}`, `readingTime: ${estimateReadingTime(form.content)}`, `featured: ${form.featured}`, '---', '', form.content].join('\n');
    return fm;
  }, [form, slug]);
  const validate = () => {
    const r = newPostSchema.safeParse({ ...form, date: new Date(form.date), tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean), content: form.content });
    return r.success ? null : r.error.issues.map((i) => `${i.path.join('.') || 'content'}: ${i.message}`).join(' · ');
  };
  const download = () => {
    const err = validate(); if (err) { setStatus(`Fix: ${err}`); return; }
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
    setStatus(`Downloaded ${fileName} — commit it to data/blog/ to publish.`);
  };
  const copy = async () => {
    const err = validate(); if (err) { setStatus(`Fix: ${err}`); return; }
    try { await navigator.clipboard.writeText(markdown); setStatus('Markdown copied to clipboard.'); } catch { setStatus('Copy failed — select the output and copy manually.'); }
  };
  const input = 'w-full rounded-xl border border-white/15 bg-[#0B0B0F] px-4 py-2.5 text-white placeholder:text-white/40 focus:border-[#B8E62D] focus:outline-none focus:ring-2 focus:ring-[#B8E62D]/40';
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <p className="rounded-2xl border border-[#B8E62D]/30 bg-[#B8E62D]/5 p-4 text-sm leading-6 text-soft-white/75">
          Client-side only (Node serverless writes are ephemeral). <strong className="text-white">Download and commit data/blog/&lt;slug&gt;.md to publish.</strong> Draft auto-saves to localStorage.
        </p>
        <input className={input} placeholder="Title" value={form.title} onChange={set('title')} />
        <div className="grid grid-cols-2 gap-4">
          <input className={input} type="date" value={form.date} onChange={set('date')} aria-label="Date" />
          <input className={input} placeholder={`slug (auto: ${slugify(form.title) || '…'})`} value={form.slug} onChange={set('slug')} />
        </div>
        <textarea className={input} rows={2} placeholder="Excerpt (20–400 chars)" value={form.excerpt} onChange={set('excerpt')} />
        <input className={input} placeholder="Tags, comma separated" value={form.tags} onChange={set('tags')} />
        <input className={input} placeholder="Author" value={form.author} onChange={set('author')} />
        <label className="flex items-center gap-2 text-sm text-white/80"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Featured post</label>
        <textarea className={`${input} font-mono text-sm`} rows={14} placeholder={"Markdown body — at least ~200 characters…"} value={form.content} onChange={set('content')} />
        <div className="flex flex-wrap gap-3">
          <button onClick={download} className="rounded-full bg-[#B8E62D] px-6 py-3 font-semibold text-black transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Download .md</button>
          <button onClick={copy} className="rounded-full border border-[#B8E62D]/50 px-6 py-3 font-semibold text-[#D9FF4B] transition-colors hover:bg-[#B8E62D]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">Copy Markdown</button>
          <button onClick={() => { setForm({ title: '', date: new Date().toISOString().slice(0, 10), slug: '', excerpt: '', tags: '', author: 'Nizar Kadri', featured: false, content: '' }); localStorage.removeItem(DRAFT_KEY); setStatus('Draft cleared.'); }} className="rounded-full border border-white/15 px-6 py-3 text-white/70 transition-colors hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Clear draft</button>
        </div>
        {status && <p role="status" className="text-sm text-[#D9FF4B]">{status}</p>}
      </div>
      <section aria-label="Preview" className="rounded-3xl border border-white/10 bg-[#0B0B0F]/95 p-6">
        <h2 className="mb-4 text-sm uppercase tracking-[0.25em] text-soft-white/50">Preview (approximate)</h2>
        <p className="text-sm text-soft-white/50">File: <span className="font-mono text-[#D9FF4B]">data/blog/{fileName}</span> · ~{estimateReadingTime(form.content)} min read</p>
        <Preview md={form.content || 'Start writing…'} />
      </section>
    </div>
  );
}
