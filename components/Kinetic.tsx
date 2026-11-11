import React from 'react';

/**
 * A heading whose letters rise into place, one after another.
 * Words stay whole (they never break mid-word). A screen reader gets the
 * sentence once, from the hidden copy; the moving letters are decoration.
 */
export function Chars({ text, from = 0 }: { text: string; from?: number }) {
  let n = from;
  const lines = text.split('\n');
  return (
    <span className="lg-chars">
      <span className="lg-sr">{text.replace(/\n/g, ' ')}</span>
      {lines.map((line, l) => (
        <React.Fragment key={l}>
          {l > 0 && <br aria-hidden="true" />}
          {line.split(' ').map((word, w) => (
            <React.Fragment key={w}>
              {w > 0 && ' '}
              <span className="lg-chars__w" aria-hidden="true">
                {Array.from(word).map((ch, i) => (
                  <span key={i} className="lg-chars__c" style={{ '--i': n++ } as React.CSSProperties}>{ch}</span>
                ))}
              </span>
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </span>
  );
}
