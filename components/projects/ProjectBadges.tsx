import clsx from 'clsx';
import type { ProjectSummary } from '../../app/lib/project-shared';

/**
 * Design system for project badges.
 * Neutral white/gray pills on dark; lime reserved for featured/status-live accents.
 * Avoids per-index rainbow colors: scannable, accessible, consistent across new projects.
 */

interface ProjectTechnologyBadgesProps {
  technologies: ProjectSummary['technologies'];
  compact?: boolean;
  max?: number;
}

interface ProjectMetaBadgesProps {
  year?: string;
  status?: string;
  impact?: string;
  className?: string;
  showFeatured?: boolean;
  featured?: boolean;
}

export function ProjectTechnologyBadges({
  technologies,
  compact = false,
  max,
}: ProjectTechnologyBadgesProps) {
  if (!technologies?.length) return null;
  const shown = typeof max === 'number' ? technologies.slice(0, max) : technologies;

  return (
    <ul aria-label="Technologies" className="flex flex-wrap gap-2">
      {shown.map((tech) => (
        <li
          key={tech}
          className={clsx(
            'inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] font-medium text-soft-white/70 backdrop-blur-sm',
            compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1 text-xs',
          )}
        >
          {tech}
        </li>
      ))}
      {typeof max === 'number' && technologies.length > max ? (
        <li className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-soft-white/50">
          +{technologies.length - max} more
        </li>
      ) : null}
    </ul>
  );
}

export function ProjectFeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B8E62D]/40 bg-[#B8E62D]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D9FF4B] backdrop-blur-sm">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#B8E62D]" />
      Featured
    </span>
  );
}

export function ProjectMetaBadges({
  year,
  status,
  impact,
  className = '',
  showFeatured = false,
  featured = false,
}: ProjectMetaBadgesProps) {
  const items = [year, status, impact].filter(Boolean);

  if (items.length === 0 && !(showFeatured && featured)) return null;

  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)} aria-label="Project meta">
      {showFeatured && featured ? <ProjectFeaturedBadge /> : null}
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-soft-white/60 backdrop-blur-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
