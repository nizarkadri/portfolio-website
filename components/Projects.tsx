'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ProjectSummary } from '../app/lib/project-shared';
import ProjectCard from './ProjectCard';

interface ProjectsProps {
  projects: ProjectSummary[];
}

const MAX_HOMEPAGE_PROJECTS = 6;

/**
 * Homepage section: first item = showcase (split), rest = 2-col grid.
 * Caps at 6 so new projects (agent3) never break layout; full archive lives at /projects.
 */
function Projects({ projects }: ProjectsProps) {
  if (projects.length === 0) return null;

  const shown = projects.slice(0, MAX_HOMEPAGE_PROJECTS);
  const [first, ...rest] = shown;

  return (
    <section aria-labelledby="projects-heading" className="relative overflow-hidden px-4 pb-20 pt-24 md:px-8 md:pt-28">
      <div className="relative mx-auto max-w-7xl">
        <motion.h2
          id="projects-heading"
          className="huge-text mb-6 select-none font-bold text-[#FF8A4C]/80 opacity-80 md:mb-8"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 0.8, x: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          PROJECTS
        </motion.h2>

        <div className="mb-12 h-px w-full bg-gradient-to-r from-[#FF8A4C]/45 via-[#FF8A4C]/15 to-transparent" />

        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-[#FF8A4C]/20 bg-[#FF8A4C]/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#FFB083]">
              Selected work
            </p>
            <p className="mt-4 text-lg leading-8 text-soft-white/70">
              A focused set of shipped projects. Browse the full archive for filters, search, and case studies.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex shrink-0 items-center rounded-full border border-[#FF8A4C]/40 bg-[#FF8A4C]/10 px-6 py-3 text-sm font-medium text-[#FFB083] transition-colors hover:bg-[#FF8A4C]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A4C]"
          >
            View all projects
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <ProjectCard
              title={first.title}
              description={first.description}
              summary={first.summary}
              imageUrl={first.imageUrl}
              slug={first.slug}
              technologies={first.technologies}
              repoUrl={first.repoUrl}
              liveUrl={first.liveUrl}
              year={first.year}
              status={first.status}
              impact={first.impact}
              highlights={first.highlights}
              featured={first.featured}
              variant="showcase"
              priority
            />
          </motion.div>

          {rest.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {rest.map((project, i) => (
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    summary={project.summary}
                    imageUrl={project.imageUrl}
                    slug={project.slug}
                    technologies={project.technologies}
                    repoUrl={project.repoUrl}
                    liveUrl={project.liveUrl}
                    year={project.year}
                    status={project.status}
                    impact={project.impact}
                    highlights={project.highlights}
                    featured={project.featured}
                    variant="grid"
                  />
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#FFB083] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A4C] rounded"
          >
            Explore all {projects.length} projects
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Projects;
