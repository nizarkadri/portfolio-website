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

const caseStudyCtaClasses =
  'border-[#B8E62D]/40 bg-[#B8E62D]/12 text-[#D9FF4B] group-hover:border-[#B8E62D]/55 group-hover:bg-[#B8E62D]/18';

/** EV-GPT card: black CTA pill */
const caseStudyCtaEvClasses =
  'border-white/20 bg-black/80 text-white group-hover:border-white/30 group-hover:bg-black group-hover:text-white';

const accentStyles = [
  {
    glow: 'from-[#B8E62D]/22 via-[#60A5FA]/12 to-transparent',
    line: 'from-[#B8E62D]/0 via-[#B8E62D]/80 to-[#60A5FA]/0',
  },
  {
    glow: 'from-[#22D3EE]/24 via-[#2563EB]/14 to-transparent',
    line: 'from-[#22D3EE]/0 via-[#22D3EE]/80 to-[#2563EB]/0',
  },
  {
    glow: 'from-[#FB7185]/22 via-[#F59E0B]/12 to-transparent',
    line: 'from-[#FB7185]/0 via-[#FB7185]/80 to-[#F59E0B]/0',
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
  const isEvGpt = slug === 'ev-gpt';

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
            <span
              className={clsx(
                'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm transition-all duration-300',
                'group-hover:px-4 group-hover:py-1.5',
                isEvGpt
                  ? clsx(
                      caseStudyCtaEvClasses,
                      'group-hover:shadow-[0_0_28px_rgba(0,0,0,0.55)] group-hover:ring-1 group-hover:ring-white/15'
                    )
                  : clsx(
                      caseStudyCtaClasses,
                      'group-hover:shadow-[0_0_28px_rgba(217,255,75,0.28)] group-hover:ring-1 group-hover:ring-[#D9FF4B]/35'
                    )
              )}
            >
              <span className="group-hover:hidden">View project</span>
              <span className="hidden items-center gap-1.5 group-hover:inline-flex">
                Open full case study
                <svg
                  className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
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