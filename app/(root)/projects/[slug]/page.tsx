// app/projects/[slug]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface Project {
    slug: string;
    title: string;
    description: string;
    imageUrl: string;
    technologies: string[];
    contentHtml: string;
}

export default function ProjectPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        // Fetch project data from API
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${slug}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Project not found');
                    }
                    throw new Error('Failed to fetch project');
                }
                
                const data = await response.json();
                setProject(data);
            } catch (err) {
                console.error('Error fetching project:', err);
                setError(err instanceof Error ? err.message : 'Failed to load project');
            } finally {
                setIsLoading(false);
            }
        };
        
        if (slug) {
            fetchProject();
        }
    }, [slug]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen py-20">
                <div className="container mx-auto px-4">
                    <Link 
                        href="/projects" 
                        className="text-white/70 hover:text-blue-400 flex items-center mb-10 text-sm transition-colors duration-300 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Projects
                    </Link>
                    
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-pulse text-xl text-white">Loading project...</div>
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
                    <Link 
                        href="/projects" 
                        className="text-white/70 hover:text-blue-400 flex items-center mb-10 text-sm transition-colors duration-300 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Projects
                    </Link>
                    
                    <div className="text-center py-20">
                        <p className="text-red-500 text-xl">{error}</p>
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
    
    // If project data is not available
    if (!project) {
        return (
            <div className="min-h-screen py-20">
                <div className="container mx-auto px-4">
                    <Link 
                        href="/projects" 
                        className="text-white/70 hover:text-blue-400 flex items-center mb-10 text-sm transition-colors duration-300 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Projects
                    </Link>
                    
                    <div className="text-center py-20">
                        <p className="text-red-500 text-xl">Project not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20">
            <div className="container mx-auto px-4">
                <Link 
                    href="/projects" 
                    className="text-white/70 hover:text-blue-400 flex items-center mb-10 text-sm transition-colors duration-300 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Projects
                </Link>

                <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/5 transition-all duration-500 hover:border-white/10 hover:shadow-xl hover:shadow-blue-500/5">
                    <div className="relative h-80 md:h-96 overflow-hidden">
                        <Image 
                            src={project.imageUrl || "/images/project-placeholder.jpg"} 
                            alt={project.title}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, 1200px"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/70 to-transparent"></div>
                        
                        {/* Project title overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                {project.title}
                            </h1>
                            
                            <div className="flex flex-wrap gap-3 mb-2">
                                {project.technologies.map((tech: string, index: number) => {
                                    // Get a unique color for each technology
                                    const colors = [
                                        "#4f46e5", // Indigo
                                        "#10b981", // Emerald
                                        "#f59e0b", // Amber
                                        "#ec4899", // Pink
                                        "#3b82f6", // Blue
                                        "#ef4444", // Red
                                        "#8b5cf6", // Violet
                                    ];
                                    
                                    const colorIndex = project.technologies.indexOf(tech) % colors.length;
                                    
                                    return (
                                        <span 
                                            key={index} 
                                            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-black/40 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:border-white/20"
                                            style={{ color: colors[colorIndex] }}
                                        >
                                            {tech}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 md:p-12">
                        <div className="max-w-3xl mx-auto">
                            <p className="text-xl text-soft-white/80 mb-8 leading-relaxed">
                                {project.description}
                            </p>
                            
                            <div 
                                className="prose prose-invert prose-lg max-w-none prose-p:text-soft-white/80 prose-headings:text-white prose-li:text-soft-white/70 prose-a:text-blue-400 prose-strong:text-blue-300 prose-pre:bg-deep-black/50 prose-pre:border prose-pre:border-white/5 prose-code:text-blue-300"
                                dangerouslySetInnerHTML={{ __html: project.contentHtml || '' }}
                            >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}