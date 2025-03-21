// app/projects/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSortedProjectsData } from '../../api/projects';

interface Project {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
}

export default function ProjectsPage() {
  // Get real project data from markdown files
  const projects = getSortedProjectsData();

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Projects</span>
        </h1>
        <p className="text-soft-white/70 mb-12 text-xl max-w-2xl">Explore my latest work and technical projects that showcase my skills and passion for creating innovative solutions.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project: Project, index: number) => (
            <div 
              key={project.slug} 
              className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 group hover:shadow-lg hover:shadow-blue-500/10"
              style={{ 
                transform: "translateY(0px)",
                transition: "transform 0.5s ease, box-shadow 0.5s ease",
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="relative h-56 overflow-hidden">
                <Image 
                  src={project.imageUrl || "/images/project-placeholder.jpg"} 
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent opacity-80"></div>
              </div>
              
              <div className="p-6 relative">
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-soft-white/70 mb-5 line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech: string, index: number) => (
                      <span 
                        key={index} 
                        className="text-xs bg-white/10 backdrop-blur-md text-white/80 px-3 py-1 rounded-full border border-white/5 hover:border-white/20 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/projects/${project.slug}`} 
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-all duration-300 group-hover:translate-x-1"
                  >
                    <span>View Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}