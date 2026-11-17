import clsx from 'clsx';
import type { ProjectSummary } from '../../app/lib/project-shared';

/**
 * Badges for a project, on the pale ground: quiet pills in ink, one filled pill
 * for "featured". No colour per technology: scannable, consistent, and it stays
 * right when a new project is added.
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

export function ProjectTechnologyBadges({ technologies, compact = false, max }: ProjectTechnologyBadgesProps) {
  if (!technologies?.length) return null;
  const shown = typeof max === 'number' ? technologies.slice(0, max) : technologies;

  return (
    <ul aria-label="Technologies" className="cs-chips">
      {shown.map((tech) => (
        <li key={tech} className={clsx('lg-chip', compact && 'cs-chip--sm')}>{tech}</li>
      ))}
      {typeof max === 'number' && technologies.length > max ? (
        <li className="lg-chip cs-chip--sm">+{technologies.length - max} more</li>
      ) : null}
    </ul>
  );
}

export function ProjectFeaturedBadge() {
  return (
    <span className="cs-tag cs-tag--ink">
      <span aria-hidden className="cs-tag__dot" />
      Featured
    </span>
  );
}

export function ProjectMetaBadges({ year, status, impact, className = '', showFeatured = false, featured = false }: ProjectMetaBadgesProps) {
  const items = [year, status, impact].filter(Boolean);
  if (items.length === 0 && !(showFeatured && featured)) return null;

  return (
    <div className={clsx('cs-tags', className)} aria-label="Project meta">
      {showFeatured && featured ? <ProjectFeaturedBadge /> : null}
      {items.map((item) => (
        <span key={item} className="cs-tag">{item}</span>
      ))}
    </div>
  );
}
