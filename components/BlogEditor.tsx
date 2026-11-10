"use client";
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { newPostSchema, estimateReadingTime } from '../app/lib/blog-shared';

// Minimal hand-rolled preview (headings/bold/italic/lists/code): the author's own draft, rendered as React nodes.
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
    <div className="bl-prose">
      {blocks.map((b, i) => {
        if (b.startsWith('# ')) return <h2 key={i}>{renderInline(b.slice(2))}</h2>;
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
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  useEffect(() => { const raw = localStorage.getItem(DRAFT_KEY); if (raw) { try { setForm(JSON.parse(raw)); } catch { /* corrupted draft ignored */ } } }, []);
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* storage full or unavailable: the draft stays in memory */ } }, [form]);
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
    return r.success ? null : r.error.issues.map((i) => `${i.path.join('.') || 'content'}: ${i.message}`).join('; ');
  };
  const download = () => {
    const err = validate(); if (err) { setStatus({ kind: 'error', text: `Fix: ${err}` }); return; }
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
    setStatus({ kind: 'ok', text: `Downloaded ${fileName}. Commit it to data/blog/ to publish.` });
  };
  const copy = async () => {
    const err = validate(); if (err) { setStatus({ kind: 'error', text: `Fix: ${err}` }); return; }
    try { await navigator.clipboard.writeText(markdown); setStatus({ kind: 'ok', text: 'Markdown copied to clipboard.' }); } catch { setStatus({ kind: 'error', text: 'Copy failed. Download the file instead.' }); }
  };
  const blank = () => ({ title: '', date: new Date().toISOString().slice(0, 10), slug: '', excerpt: '', tags: '', author: 'Nizar Kadri', featured: false, content: '' });
  const clear = () => { setForm(blank()); try { localStorage.removeItem(DRAFT_KEY); } catch { /* nothing stored */ } setStatus({ kind: 'ok', text: 'Draft cleared.' }); };
  return (
    <div className="bl-editor">
      <div className="bl-editor__form">
        <p className="bl-editor__note">
          This editor runs in the browser only. <strong>Download the file and commit it to data/blog/&lt;slug&gt;.md to publish.</strong> The draft saves itself to this browser as you type.
        </p>
        <div className="fx-field">
          <label className="fx-label" htmlFor="ed-title">Title</label>
          <input id="ed-title" className="fx-input" value={form.title} onChange={set('title')} />
        </div>
        <div className="fx-pair">
          <div className="fx-field">
            <label className="fx-label" htmlFor="ed-date">Date</label>
            <input id="ed-date" className="fx-input" type="date" value={form.date} onChange={set('date')} />
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="ed-slug">Slug <span className="fx-opt">(optional)</span></label>
            <input id="ed-slug" className="fx-input fx-input--mono" placeholder={slugify(form.title)} value={form.slug} onChange={set('slug')} />
          </div>
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="ed-excerpt">Excerpt</label>
          <textarea id="ed-excerpt" className="fx-input fx-input--short" rows={2} value={form.excerpt} onChange={set('excerpt')} aria-describedby="ed-excerpt-hint" />
          <p id="ed-excerpt-hint" className="fx-hint">Between 20 and 400 characters.</p>
        </div>
        <div className="fx-pair">
          <div className="fx-field">
            <label className="fx-label" htmlFor="ed-tags">Tags</label>
            <input id="ed-tags" className="fx-input" placeholder="RAG, Python" value={form.tags} onChange={set('tags')} aria-describedby="ed-tags-hint" />
            <p id="ed-tags-hint" className="fx-hint">Separate with commas.</p>
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="ed-author">Author</label>
            <input id="ed-author" className="fx-input" value={form.author} onChange={set('author')} />
          </div>
        </div>
        <label className="bl-check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Featured post</label>
        <div className="fx-field">
          <label className="fx-label" htmlFor="ed-body">Body, in Markdown</label>
          <textarea id="ed-body" className="fx-input fx-input--mono" rows={16} value={form.content} onChange={set('content')} aria-describedby="ed-body-hint" spellCheck />
          <p id="ed-body-hint" className="fx-hint">At least 200 characters.</p>
        </div>
        <div className="bl-editor__actions">
          <button type="button" onClick={download} className="lg-cta">Download .md</button>
          <button type="button" onClick={copy} className="bc-btn">Copy Markdown</button>
          <button type="button" onClick={clear} className="bc-btn">Clear draft</button>
        </div>
        <p role="status" className="bl-editor__status" data-kind={status?.kind}>{status?.text ?? ''}</p>
      </div>
      <section aria-labelledby="ed-preview" className="bl-editor__preview">
        <h2 id="ed-preview" className="lg-display lg-display--sm">Preview</h2>
        <p className="lg-note">data/blog/{fileName} · about {estimateReadingTime(form.content)} min read</p>
        <Preview md={form.content || 'Start writing and the preview appears here.'} />
      </section>
    </div>
  );
}
