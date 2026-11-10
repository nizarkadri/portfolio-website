'use client';

interface ResumeRequestButtonProps {
  onClick: () => void;
  label?: string;
}

/** A quiet inline button that starts a resume request. The request itself lives on /contact. */
const ResumeRequestButton = ({ onClick, label = 'Request my resume' }: ResumeRequestButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '2.75rem', padding: '0 1rem',
      background: 'transparent', color: 'var(--sc-ink)', border: '1px solid var(--sc-hairline-strong)', borderRadius: 'var(--sc-r-sm)',
      fontFamily: 'var(--sc-font-text)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
    }}
  >
    {label}
  </button>
);

export default ResumeRequestButton;
