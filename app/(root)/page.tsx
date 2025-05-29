  // app/(pages)/page.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Skills from '../../components/Skills';
import Hero from '../../components/Hero';
import Projects from '../../components/Projects';
import Experience from '../../components/Experience';
import Test from '../../components/Test';

const Home = () => {
  
  // useEffect(() => {
  //   const skillItems = document.querySelectorAll('.skill-item.floating');
    
  //   skillItems.forEach((item) => {
  //     // Random starting position
  //     const xStart = Math.random() * 80;
  //     const yStart = Math.random() * 80;
      
  //     // Random middle position
  //     const xMid = Math.random() * 80;
  //     const yMid = Math.random() * 80;
      
  //     // Random end position (complete the loop)
  //     const xEnd = xStart + Math.random() * 20 - 10;
  //     const yEnd = yStart + Math.random() * 20 - 10;
      
  //     // Random animation duration between 15 and 40 seconds
  //     const floatTime = 15 + Math.random() * 25;
      
  //     // Random delay so all animations don't start at once
  //     const floatDelay = Math.random() * 10;
      
  //     // Set CSS variables for the animation
  //     const htmlItem = item as HTMLElement;
  //     console.log(htmlItem);
  //     htmlItem.style.setProperty('--x-start', `${xStart}%`);
  //     htmlItem.style.setProperty('--y-start', `${yStart}%`);
  //     htmlItem.style.setProperty('--x-mid', `${xMid}%`);
  //     htmlItem.style.setProperty('--y-mid', `${yMid}%`);
  //     htmlItem.style.setProperty('--x-end', `${xEnd}%`);
  //     htmlItem.style.setProperty('--y-end', `${yEnd}%`);
  //     htmlItem.style.setProperty('--float-time', `${floatTime}s`);
  //     htmlItem.style.setProperty('--float-delay', `${floatDelay}s`);
      
  //     // Set initial position
  //     htmlItem.style.left = `${xStart}%`;
  //     htmlItem.style.top = `${yStart}%`;
  //   });
    
  // }, []);

  return (
    <div>
      {/* Hero Section inspired by NeoCultural Couture */}
      
      <Hero />

      {/* Skills Section - Inspired by uxdesignerstockholm.se */}
      <Skills />

      {/* Experience Preview Section */}
      <Experience />
      
      {/* Projects Preview Section */}
      <Projects />
    </div>
  );
};

export default Home;