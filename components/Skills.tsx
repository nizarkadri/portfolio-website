'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useReducedMotion, AnimatePresence } from 'framer-motion';
import SkillIcon from './SkillIcon';
import SkillTitle from './SkillTitle';
import SkillCloud from './SkillCloud';
import { 
  generateMobbinPositions, 
  // shouldExcludeSkill,
  type PositionProps 
} from '../utils/skill-utils';
import { generateSkillIds } from '../utils/3d-utils';
import { useIsMobile } from '../app/hooks/useMobile';

// Constants
const MAX_VISIBLE_SKILLS = 12; // For floating icons only
const SKILL_ICON_SIZE = 80;
const SKILL_ICON_SIZE_MOBILE = 50;
const ROTATION_INTERVAL = 6000;
// const PRIMARY_COLOR = '#B8E62D';

// Hardcoded skills list - no API call needed
const ALL_SKILLS = [
  'React', 'Nextjs', 'JavaScript', 'Typescript', 'NodeJs', 'Vue',
  'Python', 'Java', 'Docker', 'Kubernetes', 'GitHub',
  'GitLab', 'Jenkins', 'Linux', 'MySQL', 'Postgresql', 'Firebase',
  'Django', 'VS_Code', 'aws', 'Azure', 'C#', 'C++', 'CSS', 'HTML5',
  'Shopify', 'WordPress'
];

interface SkillsState {
  available: string[];
  visible: string[]; // For floating icons (limited to 12)
  allSkills: string[]; // For text cloud (all skills)
  ids: string[];
  highlighted: number[];
  active: string | null;
}

interface UIState {
  isLoading: boolean;
  // showingOverlay: boolean;
  // currentCompanyIndex: number;
  mousePosition: { x: number; y: number };
  // isHovered: boolean;
}

const Skills = () => {

  const isMobile = useIsMobile();
  // Grouped state for skills-related data
  const [skillsState, setSkillsState] = useState<SkillsState>({
    available: [],
    visible: [],
    allSkills: [],
    ids: [],
    highlighted: [],
    active: null,
  });

  // Grouped state for UI-related data
  const [uiState, setUIState] = useState<UIState>({
    isLoading: true,
    // showingOverlay: false,
    // currentCompanyIndex: 0,
    mousePosition: { x: 0, y: 0 },
    // isHovered: false,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  // const collageRef = useRef<HTMLDivElement>(null);
  // const animationFrameRef = useRef<number | undefined>(undefined);
  const prefersReducedMotion = useReducedMotion();
  // const isInView = useInView(containerRef, { once: false, amount: 0.2 });

  // // Companies data with fallback
  // const companies = useMemo(() => [
  //   { name: 'CGI', logo: '/images/Experience/CGI.svg' },
  //   { name: 'Fiera Capital', logo: '/images/Experience/FieraCapital.png' },
  // ], []);

  // Memoized positions calculation (for floating icons)
  const positions = useMemo((): PositionProps[] => {
    if (uiState.isLoading || skillsState.visible.length === 0) return [];
    return generateMobbinPositions(MAX_VISIBLE_SKILLS);
  }, [uiState.isLoading, skillsState.visible]);

  // Memoized filtered skills (for text cloud - show all skills)
  const filteredAvailableSkills = useMemo(() => {
    return ALL_SKILLS; // Show ALL skills in text cloud, no filtering at all
  }, []);

  // Stable ID generation
  const updateSkillsWithStableIds = useCallback((skills: string[]) => {
    const stableIds = generateSkillIds(skills);
    setSkillsState(prev => ({
      ...prev,
      visible: skills,
      allSkills: skills,
      ids: stableIds
    }));
  }, []);

  // === SKILLS EFFECTS ===
  
  // Initialize skills on mount - separate logic for icons vs text cloud
  useEffect(() => {
    const initializeSkills = () => {
      // Use all skills for both floating icons and text cloud
      const initialVisibleSkills = ALL_SKILLS.slice(0, MAX_VISIBLE_SKILLS); // Limited for icons
      
      setSkillsState(prev => ({
        ...prev,
        available: ALL_SKILLS, // All skills available for icon rotation pool
        allSkills: ALL_SKILLS, // All skills for text cloud (unfiltered)
      }));
      
      updateSkillsWithStableIds(initialVisibleSkills); // Limited for icons
      setUIState(prev => ({ ...prev, isLoading: false }));
    };

    initializeSkills();
  }, [updateSkillsWithStableIds]);

  // Rotate skills periodically (for floating icons only)
  useEffect(() => {
    if (uiState.isLoading || !skillsState.available || skillsState.available.length <= MAX_VISIBLE_SKILLS) return;

    const rotateSkills = () => {
      const keepCount = Math.floor(MAX_VISIBLE_SKILLS * 2/3);
      const replaceCount = MAX_VISIBLE_SKILLS - keepCount;
      const keepSkills = skillsState.visible.slice(0, keepCount);
      const unusedSkills = skillsState.available.filter(skill => !skillsState.visible.includes(skill));
      
      let newSkills: string[] = [];
      if (unusedSkills.length >= replaceCount) {
        newSkills = Array.from({ length: replaceCount }).map(() => {
          const randomIndex = Math.floor(Math.random() * unusedSkills.length);
          const selected = unusedSkills[randomIndex];
          unusedSkills.splice(randomIndex, 1);
          return selected;
        });
      } else {
        newSkills = [
          ...unusedSkills,
          ...skillsState.available.slice(0, replaceCount - unusedSkills.length)
        ];
      }

      const updatedSkills = [...keepSkills, ...newSkills];
      updateSkillsWithStableIds(updatedSkills);
    };

    const intervalId = setInterval(rotateSkills, ROTATION_INTERVAL);
    return () => clearInterval(intervalId);
  }, [uiState.isLoading, skillsState.available, skillsState.visible, updateSkillsWithStableIds]);

  // Randomly highlight skills (for floating icons)
  useEffect(() => {
    if (uiState.isLoading || skillsState.visible.length === 0) return;

    const highlightRandomSkills = () => {
      const maxHighlights = Math.min(3, skillsState.visible.length);
      const newHighlights: number[] = [];
      
      while (newHighlights.length < maxHighlights) {
        const randomIndex = Math.floor(Math.random() * skillsState.visible.length);
        if (!newHighlights.includes(randomIndex)) {
          newHighlights.push(randomIndex);
        }
      }
      
      setSkillsState(prev => ({ ...prev, highlighted: newHighlights }));
    };

    highlightRandomSkills();
    const intervalId = setInterval(highlightRandomSkills, 4000);
    return () => clearInterval(intervalId);
  }, [uiState.isLoading, skillsState.visible]);

  // === UNUSED CODE ===
  
  // // Company overlay rotation
  // useEffect(() => {
  //   if (uiState.isLoading || skillsState.visible.length === 0) return;

  //   const toggleOverlay = () => {
  //     setUIState(prev => ({ ...prev, showingOverlay: true }));
      
  //     // setTimeout(() => {
  //     //   setUIState(prev => ({ ...prev, showingOverlay: false }));
        
  //     //   setTimeout(() => {
  //     //     setUIState(prev => ({ 
  //     //       ...prev, 
  //     //       currentCompanyIndex: (prev.currentCompanyIndex + 1) % companies.length 
  //     //     }));
  //     //   }, 500);
  //     // }, 3000);
  //   };

  //   const intervalId = setInterval(toggleOverlay, 8000);
  //   return () => clearInterval(intervalId);
  // }, [uiState.isLoading, skillsState.visible]);

  // // Optimized mouse auto-rotation with requestAnimationFrame
  // useEffect(() => {
  //   const animate = () => {
  //     setUIState(prev => ({
  //       ...prev,
  //       mousePosition: {
  //         x: prev.mousePosition.x + 0.05,
  //         y: Math.sin(Date.now() / 2000) * 5
  //       }
  //     }));
  //     animationFrameRef.current = requestAnimationFrame(animate);
  //   };

  //   animationFrameRef.current = requestAnimationFrame(animate);
    
  //   return () => {
  //     if (animationFrameRef.current) {
  //       cancelAnimationFrame(animationFrameRef.current);
  //     }
  //   };
  // }, []);


  const renderSkillIcon = useCallback((skill: string, index: number, skillId: string) => {
    if (!positions || positions.length === 0) return null;
    // Remove filtering to allow all skills to show as floating icons
    // const shouldRenderSkill = !shouldExcludeSkill(skill) && skill !== 'C#';
    // if (!shouldRenderSkill) return null;
    
    const position = positions[index % positions.length];
    if (!position) return null;

    const isHighlighted = skillsState.highlighted.includes(index);

    return (
      <SkillIcon
        key={skillId}
        skill={skill}
        index={index}
        skillId={skillId}
        position={position}
        isHighlighted={isHighlighted}
        prefersReducedMotion={prefersReducedMotion}
        iconSize={isMobile ? SKILL_ICON_SIZE_MOBILE : SKILL_ICON_SIZE}
      />
    );
  }, [positions, skillsState.highlighted, prefersReducedMotion, isMobile]);

  // Fallback for company data
  // const currentCompany = companies[uiState.currentCompanyIndex] || companies[0];

  return (
    <section className="relative py-24 md:mb-10" id="skills">
      <h2 className="huge-text absolute -top-8 left-0 opacity-40 text-[#B8E62D]/10 font-bold select-none">SKILLS</h2>
      
      <SkillTitle />
      
      <div className="container px-4 mx-auto">
        {uiState.isLoading ? (
          <div className="text-center text-[#FFFFFF]">Loading skills...</div>
        ) : (
          <div ref={containerRef} className="relative w-full h-[600px] grid place-items-center">
            {/* Skill icons floating layer */}
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="relative w-full h-full pointer-events-auto">
                <AnimatePresence mode="sync">
                  {skillsState.visible.map((skill: string, index: number) => 
                    renderSkillIcon(skill, index, skillsState.ids[index])
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Skill text collage in the middle */}
            <div className="absolute inset-0 z-10">
              <SkillCloud
                availableSkills={filteredAvailableSkills}
                mousePosition={uiState.mousePosition}
                activeSkill={skillsState.active}
                // onSkillClick={handleSkillClick}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
