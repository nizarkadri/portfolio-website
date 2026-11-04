// app/projects/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProjectSlugs, getProjectData, getSortedProjectsData } from '../../../lib/projects';
import { ProjectMetaBadges, ProjectTechnologyBadges } from '../../../../components/projects/ProjectBadges';
import { ProjectImage } from '../../../../components/projects/ProjectImage';
import { ProjectLinks } from '../../../../components/projects/ProjectLinks';

export async function generateStaticParams() {
  return getAllProjectSlugs();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await getProjectData(slug);
    const title = `${p.title} — Project Case Study`;
    const description = p.description || p.summary;
    return {
      title,
      description,
      keywords: p.technologies,
      openGraph: { title, description, images: [p.imageUrl] },
      twitter: { card: 'summary_large_image', title, description, images: [p.imageUrl] },
    };
  } catch {
    return { title: 'Project not found' };
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let project;
  try {
    project = await getProjectData(slug);
  } catch {
    notFound();
  }

  const all = await getSortedProjectsData();
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : all[all.length - 1];
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : all[0];

  const metrics = [
    project.impact ? { label: 'Impact', value: project.impact } : null,
    project.year ? { label: 'Year', value: project.year } : null,
    project.status ? { label: 'Status', value: project.status } : null,
    project.technologies.length ? { label: 'Stack', value: `${project.technologies.length} technologies` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-soft-white/50">
          <Link href="/" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] rounded">Home</Link>
          <span aria-hidden>/</span>
          <Link href="/projects" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] rounded">Projects</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-white">{project.title}</span>
        </nav>

        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0F]">
          <div className="relative aspect-[16/8] min-h-[280px] overflow-hidden bg-[#050816]">
            <ProjectImage src={project.imageUrl} alt={project.title} fill priority sizes="(max-width:768px) 100vw, 1100px" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-black/40 to-transparent" />
          </div>
          <div className="p-7 md:p-10">
            <ProjectMetaBadges year={project.year} status={project.status} showFeatured featured={project.featured} className="mb-4" />
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl">{project.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-soft-white/70">{project.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <ProjectLinks liveUrl={project.liveUrl} repoUrl={project.repoUrl} />
              <ProjectTechnologyBadges technologies={project.technologies} />
            </div>
          </div>
        </header>

        {/* Metrics */}
        {metrics.length > 0 ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D9FF4B]">{m.label}</dt>
                <dd className="mt-2 text-sm leading-6 text-soft-white/75">{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {/* Body + highlights rail */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article
            className="prose prose-invert prose-lg max-w-none prose-p:text-soft-white/80 prose-headings:text-white prose-li:text-soft-white/70 prose-a:text-[#D9FF4B] prose-strong:text-white prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/50 prose-code:text-[#D9FF4B]"
            dangerouslySetInnerHTML={{ __html: project.contentHtml }}
          />
          {project.highlights.length > 0 ? (
            <aside aria-label="Highlights" className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#D9FF4B]">Highlights</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-soft-white/75">
                {project.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8E62D]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-white/10 pt-5">
                <ProjectTechnologyBadges technologies={project.technologies} />
              </div>
            </aside>
          ) : null}
        </div>

        {/* Prev / Next */}
        {all.length > 1 ? (
          <nav aria-label="More projects" className="mt-14 grid gap-4 sm:grid-cols-2">
            {prev && prev.slug !== slug ? (
              <Link href={`/projects/${prev.slug}`} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-[#B8E62D]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">
                <span className="text-xs uppercase tracking-[0.22em] text-soft-white/50">← Previous</span>
                <span className="mt-1 block font-medium text-white group-hover:text-[#D9FF4B]">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && next.slug !== slug ? (
              <Link href={`/projects/${next.slug}`} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right transition-colors hover:border-[#B8E62D]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">
                <span className="text-xs uppercase tracking-[0.22em] text-soft-white/50">Next →</span>
                <span className="mt-1 block font-medium text-white group-hover:text-[#D9FF4B]">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
