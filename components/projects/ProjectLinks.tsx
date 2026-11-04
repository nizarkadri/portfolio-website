import Link from 'next/link';
import clsx from 'clsx';

interface ProjectLinksProps {
  liveUrl?: string;
  repoUrl?: string;
  compact?: boolean;
  className?: string;
}

const ArrowIcon = () => (
  <svg className="ml-1.5 h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
      clipRule="evenodd"
    />
  </svg>
);

const GithubIcon = () => (
  <svg className="ml-1.5 h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

function LinkButton({ href, label, primary = false, compact = false, icon }: { href: string; label: string; primary?: boolean; compact?: boolean; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${label} (opens in new tab)`}
      className={clsx(
        'inline-flex items-center justify-center rounded-full border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        primary
          ? 'border-[#B8E62D]/50 bg-[#B8E62D]/10 text-[#D9FF4B] hover:bg-[#B8E62D]/20'
          : 'border-white/15 bg-white/5 text-soft-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white',
      )}
    >
      {label}
      {icon}
    </Link>
  );
}

export function ProjectLinks({ liveUrl, repoUrl, compact = false, className = '' }: ProjectLinksProps) {
  if (!liveUrl && !repoUrl) return null;
  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
      {liveUrl ? <LinkButton href={liveUrl} label="Live Preview" primary compact={compact} icon={<ArrowIcon />} /> : null}
      {repoUrl ? <LinkButton href={repoUrl} label="GitHub" compact={compact} icon={<GithubIcon />} /> : null}
    </div>
  );
}
