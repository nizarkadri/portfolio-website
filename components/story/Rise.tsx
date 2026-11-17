import React from 'react';

/**
 * Words whose letters rise into place, one after another, when the block they sit in scrolls into view
 * (the scroll engine adds `sc-in` to the nearest [data-sc-in] once). A screen reader gets the text once,
 * from the hidden copy; the moving letters are decoration.
 */
export function Rise({ text }: { text: string }) {
  let n = 0;
  return (
    <span className="rt">
      <span className="lg-sr">{text}</span>
      {text.split(' ').map((word, w) => (
        <React.Fragment key={w}>
          {w > 0 && ' '}
          <span className="rt__w" aria-hidden="true">
            {Array.from(word).map((ch, i) => (
              <span key={i} className="rt__c" style={{ '--i': n++ } as React.CSSProperties}>{ch}</span>
            ))}
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}
