'use client';

import React, { useEffect, useState } from 'react';

const Skills = () => {
  const [skillNames, setSkillNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the skill icons from the API route
    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/skill-icons');
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        
        const iconFiles = await response.json();
        // Convert filenames to skill names by removing .svg extension
        const names = iconFiles.map((skill: string) => skill.replace('.svg', ''));
        setSkillNames(names);
      } catch (error) {
        console.error('Error fetching skills:', error);
        // Fallback to static list in case of error
        setSkillNames(['javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'html5', 'css3', 'git']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Skills</h2>
          <p className="text-xl text-gray-400 text-center max-w-3xl">
            Technologies and languages I work with
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center">Loading skills...</div>
        ) : (
          <div className="floating-skills-container">
            {skillNames.map((skill, index) => (
              <div className="skill-item floating" key={index}>
                <img src={`/images/icons/${skill}.svg`} alt={skill} className="skill-logo" />
                <span>{skill}</span>
              </div>
            ))}
            <div className="skill-item floating">
              <img src="/images/icons/java.svg" alt="Java" className="skill-logo" />
              <span>Java</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;