  // app/(pages)/page.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Skills from '../../components/Skills';
import Hero from '../../components/Hero';
import Projects from '../../components/Projects';
import Experience from '../../components/Experience';
// import Test from '../../components/Test'; // Assuming Test component is not needed for this section
import ChessProfile from '../../components/ChessProfile';
import DuolingoProfile from '../../components/DuolingoProfile';
import LeetCodeProfile from '../../components/LeetCodeProfile';

const Home = () => {
  useEffect(() => {
    const skillItems = document.querySelectorAll('.skill-item.floating');
    
    skillItems.forEach((item) => {
      // Random starting position
      const xStart = Math.random() * 80;
      const yStart = Math.random() * 80;
      
      // Random middle position
      const xMid = Math.random() * 80;
      const yMid = Math.random() * 80;
      
      // Random end position (complete the loop)
      const xEnd = xStart + Math.random() * 20 - 10;
      const yEnd = yStart + Math.random() * 20 - 10;
      
      // Random animation duration between 15 and 40 seconds
      const floatTime = 15 + Math.random() * 25;
      
      // Random delay so all animations don't start at once
      const floatDelay = Math.random() * 10;
      
      // Set CSS variables for the animation
      const htmlItem = item as HTMLElement;
      console.log(htmlItem);
      htmlItem.style.setProperty('--x-start', `${xStart}%`);
      htmlItem.style.setProperty('--y-start', `${yStart}%`);
      htmlItem.style.setProperty('--x-mid', `${xMid}%`);
      htmlItem.style.setProperty('--y-mid', `${yMid}%`);
      htmlItem.style.setProperty('--x-end', `${xEnd}%`);
      htmlItem.style.setProperty('--y-end', `${yEnd}%`);
      htmlItem.style.setProperty('--float-time', `${floatTime}s`);
      htmlItem.style.setProperty('--float-delay', `${floatDelay}s`);
      
      // Set initial position
      htmlItem.style.left = `${xStart}%`;
      htmlItem.style.top = `${yStart}%`;
    });
    
  }, []);

  return (
    <div className="space-y-40">
      {/* Hero Section inspired by NeoCultural Couture */}
      
      <Hero />

      {/* Skills Section - Inspired by uxdesignerstockholm.se */}
      <div className="hidden md:block">
        <Skills />
      </div>

      {/* Experience Preview Section */}
      <Experience />
      
      {/* Projects Preview Section */}
      <Projects />

      {/* New "Beyond Work" Section */}
      <section id="beyond-work">
        {/* Full-screen image for mobile, specific height for desktop */}
        <div className="relative w-full h-screen md:h-[60vh] bg-cover bg-center" style={{ backgroundImage: "url('/images/tech-background.jpg')" }}>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50"> {/* Overlay for text readability */}
            <h2 className="text-white text-5xl md:text-7xl font-bold text-center">
              Beyond Work
            </h2>
          </div>
        </div>

        {/* Profile Cards */}
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <h3 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">
            Interests & Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ChessProfile />
            <DuolingoProfile />
            <LeetCodeProfile />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;