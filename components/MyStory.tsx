import React from 'react';
import { storyData } from './StoryData';

/** The story as three phases of one game. */
const MyStory = () => (
  <section className="ae-section lg-wrap" aria-labelledby="ae-story-title">
    <header className="ae-head" data-sc-in>
      <h2 id="ae-story-title" className="lg-display lg-display--lg">One game, three phases.</h2>
    </header>
    <ol className="ae-story">
      {storyData.map((chapter) => (
        <li key={chapter.id} data-sc-in>
          <p className="ae-story__phase lg-display lg-display--sm">{chapter.phase}</p>
          <div className="ae-story__body">
            <h3 className="lg-display lg-display--md">{chapter.title}</h3>
            {chapter.content.map((p) => (
              <p key={p} className="lg-body">{p}</p>
            ))}
            {chapter.principles && (
              <dl className="ae-principles">
                {chapter.principles.map((pr) => (
                  <div key={pr.title}>
                    <dt>{pr.title}</dt>
                    <dd>{pr.text}</dd>
                  </div>
                ))}
              </dl>
            )}
            {chapter.closing?.map((p) => (
              <p key={p} className="lg-body">{p}</p>
            ))}
          </div>
        </li>
      ))}
    </ol>
  </section>
);

export default MyStory;
