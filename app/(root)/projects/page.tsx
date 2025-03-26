// app/projects/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ProjectCard from '../../../components/ProjectCard';

interface Project {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    // Fetch projects from API
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Projects</span>
          </h1>
          <p className="text-soft-white/70 mb-12 text-xl max-w-2xl">Explore my latest work and technical projects that showcase my skills and passion for creating innovative solutions.</p>
          
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-xl text-white">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Projects</span>
          </h1>
          <p className="text-soft-white/70 mb-12 text-xl max-w-2xl">Explore my latest work and technical projects that showcase my skills and passion for creating innovative solutions.</p>
          
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Projects</span>
        </h1>
        <p className="text-soft-white/70 mb-12 text-xl max-w-2xl">Explore my latest work and technical projects that showcase my skills and passion for creating innovative solutions.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project: Project) => (
            <ProjectCard
              key={project.slug}
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl || "/images/project-placeholder.jpg"}
              slug={project.slug}
              technologies={project.technologies}
            />
          ))}
        </div>
      </div>
    </div>
  );
}