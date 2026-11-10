"use client";
import { useEffect, useRef, useState } from 'react';

type Note = { kind: 'ok' | 'error'; text: string } | null;

export default function BlogShare({ title, url }: { title: string; url: string }) {
  const [note, setNote] = useState<Note>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const say = (n: Note) => {
    setNote(n);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(null), 2400);
  };
  const write = async (text: string, done: string) => {
    try { await navigator.clipboard.writeText(text); say({ kind: 'ok', text: done }); }
    catch { say({ kind: 'error', text: 'Could not copy. Copy the address from the bar instead.' }); }
  };
  const copy = () => write(url, 'Link copied.');
  const share = async () => {
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title, url }); return; }
      catch (e) { if (e instanceof DOMException && e.name === 'AbortError') return; }
    }
    await write(`${title}: ${url}`, 'Title and link copied.');
  };

  return (
    <div className="bl-share">
      <div className="bl-share__row">
        <button type="button" className="bc-btn" onClick={copy}>Copy link</button>
        <button type="button" className="bc-btn" onClick={share}>Share</button>
        <a className="bc-btn" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Post to X</a>
      </div>
      <p className="bl-share__status lg-note" role="status" data-kind={note?.kind}>
        {note?.text ?? ''}
      </p>
    </div>
  );
}
