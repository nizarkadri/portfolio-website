import Link from 'next/link';
import clsx from 'clsx';
import type { ProjectSummary } from '../app/lib/project-shared';
import { ProjectMetaBadges, ProjectTechnologyBadges } from './projects/ProjectBadges';
import { ProjectImage } from './projects/ProjectImage';
import { ProjectLinks } from './projects/ProjectLinks';

export type ProjectCardVariant = 'showcase' | 'grid' | 'compact';

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
  featured?: boolean;
  variant?: ProjectCardVariant;
};

const cardBase =
  'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0F]/95 shadow-[0_16px_50px_rgba(0,0,0,0.35)] transition-colors duration-300 hover:border-[#FF8A4C]/35 hover:bg-[#0D0D12]';

/**
 * Unified card. Variants:
 * - showcase: horizontal split (homepage first item / detail-like), alternating order
 * - grid: vertical card for grid/bento layouts (image on top)
 * - compact: small bento cell (image + title + 2 tech)
 * Stretched-link: title link covers card via ::after (single tab stop per card).
 */
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
  featured = false,
  variant = 'grid',
}) => {
  const bodyCopy = summary || description;

  if (variant === 'showcase') {
    const isReversed = index % 2 === 1;
    return (
      <article className={clsx(cardBase, 'lg:grid lg:grid-cols-2', className)}>
        <Link
          href={`/projects/${slug}`}
          className="relative block min-h-[280px] overflow-hidden bg-[#050816] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF8A4C]"
          aria-label={`View case study: ${title}`}
        >
          <ProjectImage
            src={imageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute left-5 top-5">
            <ProjectMetaBadges year={year} status={status} showFeatured featured={featured} />
          </span>
        </Link>

        <div className={clsx('flex flex-col justify-between p-7 md:p-9', isReversed && 'lg:order-first')}>
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[#FFB083]">
              {featured ? 'Featured project' : 'Selected project'}
              {year ? ` · ${year}` : ''}
            </p>
            <h3 className="text-2xl font-semibold leading-tight text-white md:text-[2rem]">
              <Link
                href={`/projects/${slug}`}
                className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A4C] transition-colors hover:text-[#FFB083]"
              >
                {title}
              </Link>
            </h3>
            <p className="mt-4 leading-7 text-soft-white/70">{bodyCopy}</p>
            {impact ? (
              <p className="mt-4 border-l-2 border-[#FF8A4C]/60 pl-3 text-sm leading-6 text-soft-white/60">{impact}</p>
            ) : null}
            {highlights.length > 0 ? (
              <ul className="mt-5 grid gap-2 text-sm leading-6 text-soft-white/70">
                {highlights.slice(0, 3).map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF8A4C]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="relative z-10 mt-7 space-y-4">
            <ProjectTechnologyBadges technologies={technologies} max={6} />
            <ProjectLinks liveUrl={liveUrl} repoUrl={repoUrl} compact />
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className={clsx(cardBase, className)}>
        <div className="relative aspect-[16/9] overflow-hidden bg-[#050816]">
          <ProjectImage
            src={imageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(max-width:640px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {featured ? (
            <span className="absolute left-4 top-4">
              <ProjectMetaBadges showFeatured featured />
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-semibold leading-snug text-white">
            <Link href={`/projects/${slug}`} className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A4C] transition-colors hover:text-[#FFB083]">
              {title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-soft-white/60">{bodyCopy}</p>
          <div className="mt-4">
            <ProjectTechnologyBadges technologies={technologies} compact max={3} />
          </div>
        </div>
      </article>
    );
  }

  // grid (default)
  return (
    <article className={clsx(cardBase, className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[#050816]">
        <ProjectImage
          src={imageUrl}
          alt=""
          fill
          priority={priority}
          sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <span className="absolute left-4 top-4">
          <ProjectMetaBadges year={year} status={status} showFeatured featured={featured} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold leading-tight text-white">
          <Link href={`/projects/${slug}`} className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A4C] transition-colors hover:text-[#FFB083]">
            {title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 leading-7 text-soft-white/65">{bodyCopy}</p>
        <div className="relative z-10 mt-5 space-y-4">
          <ProjectTechnologyBadges technologies={technologies} compact max={4} />
          <ProjectLinks liveUrl={liveUrl} repoUrl={repoUrl} compact />
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
