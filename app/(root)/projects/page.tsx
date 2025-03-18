// app/projects/page.tsx
import React from 'react';
import Link from 'next/link';

export default function ProjectsPage() {
  // Placeholder project data (in a real app, this would come from an API or database)
  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'A modern e-commerce platform built with React, Node.js, and MongoDB.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
      image: '/images/project-placeholder.jpg',
      slug: 'e-commerce-platform'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates.',
      technologies: ['React', 'Firebase', 'Tailwind CSS'],
      image: '/images/project-placeholder.jpg',
      slug: 'task-management-app'
    },
    {
      id: 3,
      title: 'Portfolio Website',
      description: 'A personal portfolio website showcasing my skills and projects.',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      image: '/images/project-placeholder.jpg',
      slug: 'portfolio-website'
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-10 text-white">Projects</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300 group">
              <div className="h-48 bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white/30 text-lg font-medium">
                  {project.title}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black to-transparent opacity-50"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-soft-white/70 mb-4 text-sm">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <Link href={`/projects/${project.slug}`} className="text-white flex items-center text-sm font-medium">
                  <span>View Project</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}