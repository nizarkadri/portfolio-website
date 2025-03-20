import Link from "next/link"

const Projects = () => {
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
        
        {/* Display a preview of projects here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 rounded-xl backdrop-blur-sm border border-white/5 group hover:border-white/10 transition-all duration-300">
            <h3 className="text-xl font-bold mb-2">E-Commerce Platform</h3>
            <p className="text-sm mb-4">A modern e-commerce platform built with React, Node.js, and MongoDB.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">React</span>
              <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">Node.js</span>
              <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">MongoDB</span>
            </div>
            <Link href="/projects/e-commerce-platform" className="text-white flex items-center text-sm font-medium">
              <span>View Project</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 rounded-xl backdrop-blur-sm border border-white/5 group hover:border-white/10 transition-all duration-300">
            <h3 className="text-xl font-bold mb-2">Task Management App</h3>
            <p className="text-sm mb-4">A collaborative task management application with real-time updates.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">React</span>
              <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">Firebase</span>
              <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">Tailwind CSS</span>
            </div>
            <Link href="/projects/task-management-app" className="text-white flex items-center text-sm font-medium">
              <span>View Project</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 rounded-xl backdrop-blur-sm border border-white/5 group hover:border-white/10 transition-all duration-300">
            <h3 className="text-xl font-bold mb-2">Portfolio Website</h3>
            <p className="text-sm mb-4">A personal portfolio website showcasing my skills and projects.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">Next.js</span>
              <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">TypeScript</span>
              <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">Tailwind CSS</span>
            </div>
            <Link href="/projects/portfolio-website" className="text-white flex items-center text-sm font-medium">
              <span>View Project</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    )
}

export default Projects;