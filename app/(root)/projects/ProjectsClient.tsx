import type { ProjectSummary } from '../../lib/project-shared';
import ProjectCard from '../../../components/ProjectCard';

interface ProjectsClientProps {
  projects: ProjectSummary[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  return (
    <div className="min-h-screen py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-[#B8E62D]/20 bg-[#B8E62D]/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#D9FF4B]">
            Project archive
          </p>
          <h1 className="huge-text font-bold leading-none text-[#B8E62D]/80 opacity-90">
            PROJECTS
          </h1>
        </div>

        <div className="space-y-10">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
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
          ))}
        </div>
      </div>
    </div>
  );
}
