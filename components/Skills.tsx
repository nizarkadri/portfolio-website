'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback, Suspense } from 'react';
import { motion, useReducedMotion, AnimatePresence, useInView } from 'framer-motion';
import SkillIcon from './SkillIcon';
import SkillTitle from './SkillTitle';
import { 
  generateMobbinPositions, 
  shouldExcludeSkill,
  type PositionProps 
} from '../utils/skill-utils';
import { generateSkillIds } from '../utils/3d-utils';
import { useIsMobile } from '../app/hooks/useMobile';
// Lazy load the heavy 3D component
const SkillCloud = React.lazy(() => import('./SkillCloud'));

// Constants
const MAX_VISIBLE_SKILLS = 12;
const SKILL_ICON_SIZE = 80;
const SKILL_ICON_SIZE_MOBILE = 50;
const ROTATION_INTERVAL = 6000;
const PRIMARY_COLOR = '#B8E62D';

// Fallback skills if API fails
const FALLBACK_SKILLS = [
  'JavaScript', 'Typescript', 'React', 'Nextjs', 'NodeJs',
  'Git-logo', 'Java'
];

interface SkillsState {
  available: string[];
  visible: string[];
  ids: string[];
  highlighted: number[];
  active: string | null;
}

interface UIState {
  isLoading: boolean;
  showingOverlay: boolean;
  currentCompanyIndex: number;
  mousePosition: { x: number; y: number };
  isHovered: boolean;
}

const Skills = () => {

  const isMobile = useIsMobile();
  // Grouped state for skills-related data
  const [skillsState, setSkillsState] = useState<SkillsState>({
    available: [],
    visible: [],
    ids: [],
    highlighted: [],
    active: null,
  });

  // Grouped state for UI-related data
  const [uiState, setUIState] = useState<UIState>({
    isLoading: true,
    showingOverlay: false,
    currentCompanyIndex: 0,
    mousePosition: { x: 0, y: 0 },
    isHovered: false,
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

  // Memoized positions calculation
  const positions = useMemo((): PositionProps[] => {
    if (uiState.isLoading || skillsState.visible.length === 0) return [];
    return generateMobbinPositions(MAX_VISIBLE_SKILLS);
  }, [uiState.isLoading, skillsState.visible]);

  // Memoized filtered skills
  const filteredAvailableSkills = useMemo(() => {
    return skillsState.available.filter(skill => !shouldExcludeSkill(skill));
  }, [skillsState.available]);

  // Stable ID generation
  const updateSkillsWithStableIds = useCallback((skills: string[]) => {
    const stableIds = generateSkillIds(skills);
    setSkillsState(prev => ({
      ...prev,
      visible: skills,
      ids: stableIds
    }));
  }, []);

  // === SKILLS EFFECTS ===
  
  // Fetch skills on mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/skill-icons');
        if (!response.ok) throw new Error('Failed to fetch skills');
        const iconFiles = await response.json();

        const names: string[] = iconFiles.map((skill: string) =>
          skill.replace('.svg', '').replace('.png', '')
        );
        
        const filteredSkills = names.filter(skill => !shouldExcludeSkill(skill));
        const initialSkills = filteredSkills.slice(0, MAX_VISIBLE_SKILLS);
        
        setSkillsState(prev => ({
          ...prev,
          available: filteredSkills,
        }));
        
        updateSkillsWithStableIds(initialSkills);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setSkillsState(prev => ({
          ...prev,
          available: FALLBACK_SKILLS,
        }));
        
        updateSkillsWithStableIds(FALLBACK_SKILLS.slice(0, MAX_VISIBLE_SKILLS));
      } finally {
        setUIState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchSkills();
  }, [updateSkillsWithStableIds]);

  // Rotate skills periodically
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

  // Randomly highlight skills
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

  // === OVERLAY EFFECTS ===
  
  // Company overlay rotation
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

  // === ANIMATION EFFECTS ===
  
  // Optimized mouse auto-rotation with requestAnimationFrame
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
    const shouldRenderSkill = !shouldExcludeSkill(skill) && skill !== 'C#';
    if (!shouldRenderSkill) return null;
    
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
  }, [positions, skillsState.highlighted, prefersReducedMotion]);

  // Fallback for company data
  // const currentCompany = companies[uiState.currentCompanyIndex] || companies[0];

  return (
    <section className="relative py-24" id="skills">
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
              <Suspense fallback={
                <div className="flex items-center justify-center h-full md:h-1/2">
                  <div className="text-soft-white/50">Loading 3D cloud...</div>
                </div>
              }>
                <SkillCloud
                  availableSkills={filteredAvailableSkills}
                  mousePosition={uiState.mousePosition}
                  activeSkill={skillsState.active}
                  // onSkillClick={handleSkillClick}
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
