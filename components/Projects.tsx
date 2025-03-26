'use client';

import { useState, useEffect } from "react";
import Link from "next/link"
import ProjectCard from "./ProjectCard"

interface Project {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
}

function Projects() {
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
  
  // Display only first 3 projects for the homepage
  const featuredProjects = projects.slice(0, 3);
  
  // Loading state
  if (isLoading) {
    return (
      <section className="relative pt-24 pb-16">
        <h2 className="huge-text absolute -top-16 left-0">PROJECTS</h2>
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center">
            <h2 className="text-4xl font-bold tracking-tight">My Work</h2>
            <div className="h-px bg-soft-black flex-grow ml-6 w-32"></div>
          </div>
          <Link href="/projects" className="px-5 py-2 border border-soft-black hover:bg-soft-black hover:text-white transition-colors">
            View All
          </Link>
        </div>
        
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading projects...</div>
        </div>
      </section>
    );
  }
  
  // Error state
  if (error) {
    return (
      <section className="relative pt-24 pb-16">
        <h2 className="huge-text absolute -top-16 left-0">PROJECTS</h2>
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center">
            <h2 className="text-4xl font-bold tracking-tight">My Work</h2>
            <div className="h-px bg-soft-black flex-grow ml-6 w-32"></div>
          </div>
          <Link href="/projects" className="px-5 py-2 border border-soft-black hover:bg-soft-black hover:text-white transition-colors">
            View All
          </Link>
        </div>
        
        <div className="text-center py-20">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-soft-black text-white rounded-md hover:bg-black"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative pt-24 pb-16">
      <h2 className="huge-text absolute -top-16 left-0">PROJECTS</h2>
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center">
          <h2 className="text-4xl font-bold tracking-tight">My Work</h2>
          <div className="h-px bg-soft-black flex-grow ml-6 w-32"></div>
        </div>
        <Link href="/projects" className="px-5 py-2 border border-soft-black hover:bg-soft-black hover:text-white transition-colors">
          View All
        </Link>
      </div>
      
      {/* Display projects from data/projects directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredProjects.map((project: Project) => (
          <ProjectCard
            key={project.slug}
            title={project.title}
            description={project.description}
            imageUrl={project.imageUrl}
            slug={project.slug}
            technologies={project.technologies}
          />
        ))}
      </div>
    </section>
  )
}

export default Projects;