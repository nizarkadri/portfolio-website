import Link from 'next/link';
import clsx from 'clsx';

interface ProjectLinksProps {
  liveUrl?: string;
  repoUrl?: string;
  compact?: boolean;
  className?: string;
}

function LinkButton({
  href,
  label,
  primary = false,
  compact = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        'inline-flex items-center justify-center rounded-full border font-medium transition-all duration-300',
        compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        primary
          ? 'border-[#B8E62D]/50 bg-[#B8E62D]/12 text-[#D9FF4B] hover:bg-[#B8E62D]/18 hover:border-[#B8E62D]'
          : 'border-white/10 bg-white/5 text-soft-white/80 hover:border-white/25 hover:bg-white/10'
      )}
    >
      {label}
    </Link>
  );
}

export function ProjectLinks({
  liveUrl,
  repoUrl,
  compact = false,
  className = '',
}: ProjectLinksProps) {
  if (!liveUrl && !repoUrl) {
    return null;
  }

  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
      {liveUrl ? <LinkButton href={liveUrl} label="Live Preview" primary compact={compact} /> : null}
      {repoUrl ? <LinkButton href={repoUrl} label="GitHub" compact={compact} /> : null}
    </div>
  );
}
