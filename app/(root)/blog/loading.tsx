import '../../blog-contact.css';

export default function Loading() {
  return (
    <div className="lg-page bl" aria-busy="true">
      <div className="lg-wrap bl-skel">
        <span className="bc-sr" role="status">Loading the notes</span>
        <i style={{ height: '3.5rem', width: 'min(100%, 28rem)' }} />
        <i style={{ width: 'min(100%, 34rem)' }} />
        <i style={{ height: '1px', marginTop: '3rem' }} />
        {[0, 1, 2].map((n) => <i key={n} style={{ height: '5.5rem' }} />)}
      </div>
    </div>
  );
}
