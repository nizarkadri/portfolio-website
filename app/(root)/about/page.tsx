import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-10 text-white">About Me</h1>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5">
            <div className="relative w-full aspect-square">
              <div className="absolute -inset-2 border border-white/5 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-0 rounded-full overflow-hidden border border-white/10 shadow-2xl">
                <Image 
                  src="/images/anime-profile.png" 
                  alt="Nizar K" 
                  width={500} 
                  height={500} 
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Nizar K</h2>
            <h3 className="text-xl text-soft-white/80">Software Engineer</h3>
            
            <div className="h-px bg-white/10 w-full"></div>
            
            <p className="text-soft-white leading-relaxed">
              I'm a passionate software engineer with expertise in building modern web applications and solving complex technical challenges. My journey in technology began with a curiosity about how digital experiences are crafted, and that curiosity has evolved into a career focused on creating innovative solutions.
            </p>
            
            <p className="text-soft-white leading-relaxed">
              With a strong foundation in both frontend and backend development, I enjoy working across the full stack to deliver cohesive and polished products. I'm particularly interested in performance optimization, clean architecture, and creating intuitive user experiences.
            </p>
            
            <div className="h-px bg-white/10 w-full"></div>
            
            <div>
              <h3 className="text-xl font-medium text-white mb-4">Core Values</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <span className="text-soft-white">Continuous learning and improvement</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <span className="text-soft-white">Attention to detail and quality</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <span className="text-soft-white">Building solutions that make an impact</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <span className="text-soft-white">Collaboration and knowledge sharing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
