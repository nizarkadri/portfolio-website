import Link from 'next/link';
import clsx from 'clsx';
import type { ProjectSummary } from '../app/lib/project-shared';
import { ProjectMetaBadges, ProjectTechnologyBadges } from './projects/ProjectBadges';
import { ProjectImage } from './projects/ProjectImage';
import { ProjectLinks } from './projects/ProjectLinks';

type ProjectCardProps = Pick<
  ProjectSummary,
  | 'title'
  | 'description'
  | 'summary'
  | 'imageUrl'
  | 'slug'
  | 'technologies'
  | 'repoUrl'
  | 'liveUrl'
  | 'year'
  | 'status'
  | 'impact'
  | 'highlights'
> & {
  index?: number;
  className?: string;
  priority?: boolean;
};

const accentStyles = [
  {
    glow: 'from-[#B8E62D]/22 via-[#60A5FA]/12 to-transparent',
    line: 'from-[#B8E62D]/0 via-[#B8E62D]/80 to-[#60A5FA]/0',
    badge: 'border-[#B8E62D]/30 bg-[#B8E62D]/12 text-[#D9FF4B]',
  },
  {
    glow: 'from-[#22D3EE]/24 via-[#2563EB]/14 to-transparent',
    line: 'from-[#22D3EE]/0 via-[#22D3EE]/80 to-[#2563EB]/0',
    badge: 'border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#67E8F9]',
  },
  {
    glow: 'from-[#FB7185]/22 via-[#F59E0B]/12 to-transparent',
    line: 'from-[#FB7185]/0 via-[#FB7185]/80 to-[#F59E0B]/0',
    badge: 'border-[#FB7185]/30 bg-[#FB7185]/10 text-[#FDB4C0]',
  },
];

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  summary,
  imageUrl,
  slug,
  technologies,
  repoUrl,
  liveUrl,
  year,
  status,
  impact,
  highlights,
  index = 0,
  className = '',
  priority = false,
}) => {
  const accent = accentStyles[index % accentStyles.length];
  const isReversed = index % 2 === 1;
  const bodyCopy = summary || description;

  return (
    <article
      className={clsx(
        'group relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,10,14,0.96),rgba(7,7,10,0.98))] shadow-[0_28px_80px_rgba(0,0,0,0.38)] transition-all duration-500 hover:-translate-y-1 hover:border-white/15',
        className
      )}
    >
      <div className={clsx('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90', accent.glow)} />
      <div className={clsx('pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r', accent.line)} />

      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <Link
          href={`/projects/${slug}`}
          className={clsx(
            'relative min-h-[300px] overflow-hidden border-b border-white/10 bg-[#050816] lg:min-h-[420px] lg:border-b-0',
            isReversed && 'lg:order-2 lg:border-b-0 lg:border-l'
          )}
        >
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-55 transition-opacity duration-500 group-hover:opacity-65" />
          <div className="pointer-events-none absolute left-6 right-6 top-6 z-20 flex items-center justify-between">
            {status ? (
              <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-soft-white/80 backdrop-blur-sm">
                {status}
              </span>
            ) : <span />}
            <span className={clsx('rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em] backdrop-blur-sm', accent.badge)}>
              View project
            </span>
          </div>
          <div className="absolute inset-5 z-10 rounded-[28px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
          <ProjectImage
            src={imageUrl}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </Link>

        <div className={clsx('relative flex flex-col justify-between p-7 md:p-8 lg:p-10', isReversed && 'lg:order-1')}>
          <div className="space-y-6">
            <div className="space-y-4">
              <ProjectMetaBadges year={year} status={status} impact={impact} />
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#D9FF4B]">Selected project</p>
                <h3 className="max-w-xl text-3xl font-semibold leading-tight text-white md:text-4xl">
                  <Link href={`/projects/${slug}`} className="transition-colors hover:text-[#D9FF4B]">
                    {title}
                  </Link>
                </h3>
                <p className="mt-4 max-w-xl text-base leading-8 text-soft-white/74 md:text-lg">
                  {bodyCopy}
                </p>
              </div>
            </div>

            {highlights.length > 0 ? (
              <ul className="grid gap-3 text-sm leading-7 text-soft-white/78">
                {highlights.slice(0, 3).map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#D9FF4B] shadow-[0_0_18px_rgba(184,230,45,0.8)]" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-8 space-y-5">
            <ProjectTechnologyBadges technologies={technologies.slice(0, 6)} />
            <ProjectLinks liveUrl={liveUrl} repoUrl={repoUrl} className="pt-1" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;