// app/projects/[slug]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProjectSlugs, getProjectData } from '../../../lib/projects';
import { ProjectMetaBadges, ProjectTechnologyBadges } from '../../../../components/projects/ProjectBadges';
import { ProjectImage } from '../../../../components/projects/ProjectImage';
import { ProjectLinks } from '../../../../components/projects/ProjectLinks';

export async function generateStaticParams() {
  return getAllProjectSlugs();
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const project = await getProjectData(slug);

    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <Link
            href="/projects"
            className="mb-10 flex items-center text-sm text-white/70 transition-colors duration-300 group hover:text-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Projects
          </Link>

          <article className="overflow-hidden rounded-3xl border border-white/6 bg-gradient-to-b from-soft-black/40 to-soft-black/10 backdrop-blur-sm transition-all duration-500 hover:border-white/10 hover:shadow-xl hover:shadow-blue-500/5">
            <div className="relative h-80 overflow-hidden md:h-[30rem]">
              <ProjectImage
                src={project.imageUrl}
                alt={project.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/70 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <ProjectMetaBadges
                  year={project.year}
                  status={project.status}
                  impact={project.impact}
                  className="mb-4"
                />
                <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl">
                  {project.title}
                </h1>
                <ProjectTechnologyBadges technologies={project.technologies} />
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="mx-auto max-w-3xl">
                <p className="mb-8 text-xl leading-relaxed text-soft-white/80">{project.description}</p>

                <ProjectLinks liveUrl={project.liveUrl} repoUrl={project.repoUrl} className="mb-10" />

                <div
                  className="prose prose-invert prose-lg max-w-none prose-p:text-soft-white/80 prose-headings:text-white prose-li:text-soft-white/70 prose-a:text-blue-400 prose-strong:text-blue-300 prose-pre:border prose-pre:border-white/5 prose-pre:bg-deep-black/50 prose-code:text-blue-300"
                  dangerouslySetInnerHTML={{ __html: project.contentHtml }}
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
