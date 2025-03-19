  // app/(pages)/page.tsx
  'use client';

  import React, { useEffect } from 'react';
  import Link from 'next/link';
  import Image from 'next/image';
  import Skills from '../../components/Skills';
  import Hero from '../../components/Hero';
  import Projects from '../../components/Projects';
  import Experience from '../../components/Experience';
  import Footer from '../../components/Footer';
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
        <Skills />
        {/* <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Skills</h2>
              <p className="text-xl text-gray-400 text-center max-w-3xl">
                Technologies and languages I work with
              </p>
            </div>
            
            <div className="floating-skills-container">
              <div className="skill-item floating">
                <img src="/images/icons/java.svg" alt="Java" className="skill-logo" />
                <span>Java</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/python.svg" alt="Python" className="skill-logo" />
                <span>Python</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/csharp.svg" alt="C#" className="skill-logo" />
                <span>C#</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/cpp.svg" alt="C++" className="skill-logo" />
                <span>C++</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/javascript.svg" alt="JavaScript" className="skill-logo" />
                <span>JavaScript</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/typescript.svg" alt="TypeScript" className="skill-logo" />
                <span>TypeScript</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/react.svg" alt="React" className="skill-logo" />
                <span>React</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/nodejs.svg" alt="Node.js" className="skill-logo" />
                <span>Node.js</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/nextjs.svg" alt="Next.js" className="skill-logo" />
                <span>Next.js</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/vuejs.svg" alt="Vue.js" className="skill-logo" />
                <span>Vue.js</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/restapi.svg" alt="REST API" className="skill-logo" />
                <span>REST API</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/wordpress.svg" alt="WordPress" className="skill-logo" />
                <span>WordPress</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/mysql.svg" alt="MySQL" className="skill-logo" />
                <span>MySQL</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/mongodb.svg" alt="MongoDB" className="skill-logo" />
                <span>MongoDB</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/git.svg" alt="Git" className="skill-logo" />
                <span>Git</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/docker.svg" alt="Docker" className="skill-logo" />
                <span>Docker</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/aws.svg" alt="AWS" className="skill-logo" />
                <span>AWS</span>
              </div>
              <div className="skill-item floating">
                <img src="/images/icons/azure.svg" alt="Azure" className="skill-logo" />
                <span>Azure</span>
              </div>
            </div>
          </div>
        </section> */}

        {/* Projects Preview Section */}
        <Projects />

        {/* Experience Preview Section */}
        <Experience />
        <Footer />
      </div>
    );
  };

  export default Home;