'use client';

import React, { useEffect, useRef, useState } from 'react';
import { storyData } from '../StoryData';
import { Rise } from '../story/Rise';

/**
 * The story as three chapters of one game, set as spreads. Beside them, held in place while they are read, the
 * name of the chapter at poster size; it wipes from Opening to Middlegame to Endgame as each chapter reaches the
 * reading line. Each chapter has its own page layout: a drop cap and a pull quote, a two-part spread, a manifesto
 * in large statements. All of it is his words; the pull quotes are lines from the chapter itself.
 */
export default function StoryChapters() {
  const root = useRef<HTMLElement>(null);
  const [on, setOn] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const chs = Array.from(el.querySelectorAll<HTMLElement>('[data-ch]'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setOn(Number((e.target as HTMLElement).dataset.ch)); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    chs.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const [spark, fusion, manifesto] = storyData;
  const quote = (s: string) => s.replace(/\.$/, '');

  return (
    <section ref={root} className="ch lg-wrap" aria-labelledby="ch-title">
      <h2 id="ch-title" className="lg-sr">The story, in three chapters</h2>
      <div className="ch__rail" aria-hidden="true">
        <p className="lg-note ch__folio">The story · {['I', 'II', 'III'][on]}</p>
        <div className="ch__words">
          {storyData.map((c, i) => <span key={c.id} className={i === on ? 'is-on' : i < on ? 'is-past' : ''}>{c.phase}</span>)}
        </div>
        <span className="ch__bar"><i style={{ transform: `scaleY(${(on + 1) / storyData.length})` }} /></span>
      </div>

      <div className="ch__body">
        {/* Opening: a drop cap, then the first spark as a pull quote */}
        <article data-ch="0" className="ch__ch ch__ch--open" aria-labelledby="ch-open">
          <header data-sc-in><p className="lg-note ch__phase">{spark.phase}</p><h3 id="ch-open" className="lg-display ch__title"><Rise text={spark.title} /></h3></header>
          <p className="ch__lede" data-sc-in>{spark.content[0]}</p>
          {spark.content[1] && <blockquote className="ch__quote" data-sc-in><p>{quote(spark.content[1])}.</p></blockquote>}
        </article>

        {/* Middlegame: two halves of one spread, then the line where they meet */}
        <article data-ch="1" className="ch__ch ch__ch--mid" aria-labelledby="ch-mid">
          <header data-sc-in><p className="lg-note ch__phase">{fusion.phase}</p><h3 id="ch-mid" className="lg-display ch__title"><Rise text={fusion.title} /></h3></header>
          <div className="ch__spread" data-sc-in data-sc-stagger="90">
            {fusion.content.map((p) => <p key={p}>{p}</p>)}
          </div>
          <blockquote className="ch__quote ch__quote--split" data-sc-in><p><span>The artist</span> <span>and the engineer.</span></p></blockquote>
        </article>

        {/* Endgame: the manifesto, three statements at size */}
        <article data-ch="2" className="ch__ch ch__ch--end" aria-labelledby="ch-end">
          <header data-sc-in><p className="lg-note ch__phase">{manifesto.phase}</p><h3 id="ch-end" className="lg-display ch__title"><Rise text={manifesto.title} /></h3></header>
          {manifesto.principles && (
            <ol className="ch__rules" data-sc-in data-sc-stagger="110">
              {manifesto.principles.map((p) => (
                <li key={p.title}><strong>{p.title}</strong><span>{p.text}</span></li>
              ))}
            </ol>
          )}
          {manifesto.closing?.map((p) => <p key={p} className="ch__close" data-sc-in>{p}</p>)}
        </article>
      </div>
    </section>
  );
}
