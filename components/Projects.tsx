'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ProjectSummary } from '../app/lib/project-shared';
import ProjectCard from './ProjectCard';

interface ProjectsProps {
  projects: ProjectSummary[];
}

function SectionHeader() {
  return (
    <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <motion.span
          className="mb-4 inline-flex rounded-full border border-[#B8E62D]/20 bg-[#B8E62D]/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#D9FF4B]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          Selected Work
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Link
          href="/projects"
          className="inline-flex items-center rounded-full border border-[#B8E62D]/40 bg-[#B8E62D]/10 px-6 py-3 text-sm font-medium text-[#D9FF4B] transition-all duration-300 hover:border-[#B8E62D] hover:bg-[#B8E62D]/15"
        >
          View all projects
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
}

function Projects({ projects }: ProjectsProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-24 md:px-8 md:pt-28">
      <div className="relative mx-auto max-w-7xl">
        <motion.h2
          className="huge-text mb-6 select-none font-bold text-[#B8E62D]/80 opacity-80 md:mb-8"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 0.8, x: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          PROJECTS
        </motion.h2>

        <motion.div
          className="mb-12 h-px w-full bg-gradient-to-r from-[#B8E62D]/45 via-[#B8E62D]/15 to-transparent"
          initial={{ opacity: 0, scaleX: 0.4 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.8 }}
        />

        <SectionHeader />

        <div className="space-y-10">
          {projects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.15 + index * 0.08 }}
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
                index={index}
                priority={index === 0}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;