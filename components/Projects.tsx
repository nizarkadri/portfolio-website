'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import ProjectCard from "./ProjectCard";
import { motion } from "framer-motion";
import {useIsMobile} from "../app/hooks/useMobile";

interface Project {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
}

const SectionTitle = () => {
  // const titleVariants = {
  //   initial: { opacity: 0, y: 20 },
  //   animate: { 
  //     opacity: 1, 
  //     y: 0,
  //     transition: {
  //       duration: 0.8,
  //       ease: [0.22, 1, 0.36, 1]
  //     }
  //   }
  // };
  
  // const underlineVariants = {
  //   initial: { width: 0 },
  //   animate: { 
  //     width: "100%",
  //     transition: {
  //       duration: 1.2, 
  //       ease: [0.22, 1, 0.36, 1],
  //       delay: 0.3
  //     }
  //   }
  // };
  
  const buttonVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.5
      }
    },
    hover: { 
      backgroundColor: "rgba(184, 230, 45, 0.08)",  // Subtle lime tint (8%)
      color: "#D9FF4B",                             // Softer neon text
      borderColor: "#B8E62D",
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <div className="flex items-center justify-between mb-16">
      <div className="flex items-center">
        <motion.div 
          className="h-px bg-[#B8E62D]/20 w-48 md:w-64"
          initial={{ opacity: 0, width: 0 }}
          whileInView={{ 
            opacity: 1, 
            width: "100%",
            transition: {
              duration: 0.8,
              delay: 0.2
            }
          }}
          viewport={{ once: true, margin: "-100px" }}
        />
      </div>
      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileInView="animate"
        whileHover="hover"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Link 
          href="/projects" 
          className="px-5 py-2 border border-[#B8E62D]/50 text-[#B8E62D] rounded-md inline-flex items-center group transition-all duration-300"
        >
          View All
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
};

function Projects() {
  const isMobile = useIsMobile();
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
        <motion.h2 
            className="huge-text absolute top-6 md:-top-16 left-[9%] md:left-0 md:translate-x-0 opacity-80 text-[#B8E62D]/90 font-bold select-none"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.8, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            PROJECTS
          </motion.h2>
        
        <SectionTitle />
        
        <div className="h-96 flex items-center justify-center">
          <motion.div 
            className="text-xl text-[#B8E62D]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Loading projects...
          </motion.div>
        </div>
      </section>
    );
  }
  
  // Error state
  if (error) {
    return (
      <section className="relative pt-24 pb-16">
        <motion.h2 
          className="huge-text absolute -top-16 left-0 opacity-40 text-[#B8E62D]/10 font-bold select-none"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.4, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          PROJECTS
        </motion.h2>
        
        <SectionTitle />
        
        <div className="text-center py-20">
          <motion.p 
            className="text-red-400 text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
          <motion.button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#B8E62D]/10 text-[#B8E62D] rounded-md hover:bg-[#B8E62D]/20 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative pt-24 pb-16">
      <motion.h2 
            className="huge-text absolute top-26 md:-top-16 left-[12%] md:left-0 md:translate-x-0 opacity-80 text-[#B8E62D]/90 font-bold select-none"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.8, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            PROJECTS
      </motion.h2>
      <div className="flex items-center mb-10">
            <motion.div 
              className="h-px bg-[#B8E62D]/20 w-full ml-[8%] md:ml-0"
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ 
                opacity: 1, 
                width: isMobile ? "85%" : "100%",
                transition: {
                  duration: 0.8,
                  delay: 0.2
                }
              }}
              viewport={{ once: false, margin: "-100px" }}
            />
      </div>
      
      {/* <SectionTitle /> */}
      
      {/* Display projects from data/projects directory */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 m-5 pt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {featuredProjects.map((project: Project, index) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <ProjectCard
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl}
              slug={project.slug}
              technologies={project.technologies}
            />
          </motion.div>
        ))}
      </motion.div>
      <div className="flex justify-center mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(184, 230, 45, 0.15)",
                borderColor: "#B8E62D",
                boxShadow: "0 0 20px rgba(184, 230, 45, 0.3)",
                transition: { duration: 0.3 }
              }}
            >
              <Link 
                href="/projects" 
                className="px-8 py-3 border border-[#B8E62D]/50 text-[#B8E62D] rounded-md inline-flex items-center group transition-all duration-300 font-medium backdrop-blur-sm bg-black/40"
              >
                View All Projects
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
    </section>
  );
}

export default Projects;