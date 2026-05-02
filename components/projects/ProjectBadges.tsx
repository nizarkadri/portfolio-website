import type { ProjectSummary } from '../../app/lib/project-shared';

const technologyColors = [
  '#4f46e5',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6',
];

interface ProjectTechnologyBadgesProps {
  technologies: ProjectSummary['technologies'];
  compact?: boolean;
}

interface ProjectMetaBadgesProps {
  year?: string;
  status?: string;
  impact?: string;
  className?: string;
}

export function ProjectTechnologyBadges({
  technologies,
  compact = false,
}: ProjectTechnologyBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {technologies.map((tech, index) => (
        <span
          key={`${tech}-${index}`}
          className={`inline-flex items-center rounded-full border border-white/10 bg-black/30 ${
            compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
          } font-medium backdrop-blur-sm transition-colors duration-300`}
          style={{ color: technologyColors[index % technologyColors.length] }}
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

export function ProjectMetaBadges({
  year,
  status,
  impact,
  className = '',
}: ProjectMetaBadgesProps) {
  const items = [year, status, impact].filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-soft-white/70"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
