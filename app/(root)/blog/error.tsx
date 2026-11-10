"use client";
import '../../blog-contact.css';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="lg-page bl">
      <div className="lg-wrap bl-head" role="alert">
        <h1 className="lg-display lg-display--lg">The notes did not load.</h1>
        <p className="lg-body lg-body--lg">{error.message || 'Could not load blog posts.'}</p>
        <button type="button" onClick={reset} className="lg-cta">Try again</button>
      </div>
    </div>
  );
}
