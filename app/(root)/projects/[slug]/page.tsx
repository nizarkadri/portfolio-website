// app/projects/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProjectSlugs, getProjectData, getSortedProjectsData } from '../../../lib/projects';
import { ProjectMetaBadges, ProjectTechnologyBadges } from '../../../../components/projects/ProjectBadges';
import { ProjectImage } from '../../../../components/projects/ProjectImage';
import { ProjectLinks } from '../../../../components/projects/ProjectLinks';
import { Chars } from '../../../../components/Kinetic';
import '../../../case-study.css';

export async function generateStaticParams() {
  return getAllProjectSlugs();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await getProjectData(slug);
    const title = `${p.title}: Project Case Study`;
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
    <div className="cs lg-page">
      <div className="lg-wrap">
        <nav aria-label="Breadcrumb" className="cs-crumbs lg-up">
          <Link href="/">Home</Link>
          <span aria-hidden>/</span>
          <Link href="/projects">Work</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">{project.title}</span>
        </nav>

        {/* What it is, in ink on the pale ground; then the picture */}
        <header className="cs-hero">
          <ProjectMetaBadges year={project.year} status={project.status} showFeatured featured={project.featured} className="lg-up" />
          <h1 className="lg-display cs-title"><Chars text={project.title} /></h1>
          <p className="cs-lede lg-up" style={{ ['--d' as string]: 520 }}>{project.description}</p>
          <div className="cs-hero__row lg-up" style={{ ['--d' as string]: 640 }}>
            <ProjectLinks liveUrl={project.liveUrl} repoUrl={project.repoUrl} />
            <ProjectTechnologyBadges technologies={project.technologies} />
          </div>
        </header>

        <div className="cs-cover">
          <ProjectImage src={project.imageUrl} alt="" fill priority sizes="(max-width: 860px) 100vw, 1300px" />
        </div>

        {/* The facts */}
        {metrics.length > 0 ? (
          <dl className="cs-facts" data-sc-in data-sc-stagger="80">
            {metrics.map((m) => (
              <div key={m.label}>
                <dt className="lg-note">{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {/* The write-up, with the highlights beside it */}
        <div className="cs-body">
          <article className="cs-prose" dangerouslySetInnerHTML={{ __html: project.contentHtml }} />
          {project.highlights.length > 0 ? (
            <aside aria-label="Highlights" className="cs-rail lg-panel">
              <h2 className="lg-note">Highlights</h2>
              <ul>
                {project.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <div className="cs-rail__stack">
                <ProjectTechnologyBadges technologies={project.technologies} compact />
              </div>
            </aside>
          ) : null}
        </div>

        {/* On to the next one */}
        {all.length > 1 ? (
          <nav aria-label="More projects" className="cs-more">
            {prev && prev.slug !== slug ? (
              <Link href={`/projects/${prev.slug}`} className="cs-more__card">
                <span className="lg-note">Previous</span>
                <span className="cs-more__title">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && next.slug !== slug ? (
              <Link href={`/projects/${next.slug}`} className="cs-more__card cs-more__card--next">
                <span className="lg-note">Next</span>
                <span className="cs-more__title">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
