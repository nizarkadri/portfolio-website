'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** Subtle 3D float for each icon */
const createFloatAnimation = (duration: number, delay: number) => ({
  animate: {
    x: [0, 20, -20, 0],
    y: [0, -10, 10, 0],
    rotate: [0, -4, 0, 4, 0],
    rotateX: [0, 6, 0, -6, 0],
    rotateY: [0, -6, 0, 6, 0],
    transition: {
      x: {
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay
      },
      y: {
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay: delay + duration / 4 // offset so Y is out of phase
      },
      rotate: {
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay
      },
      rotateX: {
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay
      },
      rotateY: {
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay
      },
    },
  }
});

/** Subtle "pulse" animation (breathing effect) */
const createPulseAnimation = (duration: number) => ({
  animate: {
    opacity: [0.9, 1, 0.9],
    scale: [1, 1.02, 1],
    transition: {
      opacity: {
        duration: duration / 0.2,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut'
      },
      scale: {
        duration: duration / 1.5,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut'
      }
    }
  }
});

type SizeType = 'xs' | 'sm' | 'md' | 'lg';
type PositionProps = {
  x: string;
  y: string;
  size: SizeType;
  delay: number;
  duration: number;
  translateX: number;
  translateY: number;
};

/**
 * Generates positions for skill icons using preset coordinates
 * in a style similar to the Mobbin layout
 */
export function generateMobbinPositions(count = 12): PositionProps[] {
  const positions: PositionProps[] = [];
  const delayRange = { min: 0, max: 5 };
  const durationRange = { min: 25, max: 35 }; // Longer durations for smoother motion
  
  // Positions inspired by Mobbin layout
  const presetPositions = [
    { x: 53.19, y: 0 },     // Top center
    { x: 93.22, y: 7.14 },  // Top right
    { x: 75.42, y: 88.57 }, // Bottom right
    { x: 16.94, y: 14.29 }, // Top left
    { x: 0.56, y: 1.71 },  // Far left top
    { x: 73.33, y: 20 },    // Right upper
    { x: 0.56, y: 42.29 }, // Far left middle
    { x: 92.36, y: 45.71 }, // Right middle
    { x: 3.39, y: 78.43 },  // Bottom left
    { x: 40.83, y: 75.71 }, // Bottom center
    { x: 93.1, y: 69.43 },  // Far right bottom
    { x: 28, y: 55 },       // Middle center
  ];

  for (let i = 0; i < count; i++) {
    // Use preset position and add small float movement
    const preset = presetPositions[i % presetPositions.length];
    
    // Generate random translation values for floating movement
    const translateX = (Math.random() * 60) - 30; // -30px to +30px
    const translateY = (Math.random() * 60) - 30; // -30px to +30px
    
    const delay = Math.random() * (delayRange.max - delayRange.min) + delayRange.min;
    const duration = Math.random() * (durationRange.max - durationRange.min) + durationRange.min;

    positions.push({
      x: `${preset.x}%`,
      y: `${preset.y}%`,
      size: 'md' as SizeType,
      delay,
      duration,
      translateX,
      translateY
    });
  }

  return positions;
}

/**
 * Get custom glow colors for skill icons
 */
function getSkillGlowColors(skill: string): { from: string; to: string } {
  const colorMap: Record<string, { from: string; to: string }> = {
    // Frontend
    React: { from: '#38bdf8', to: '#3b82f6' },
    Nextjs: { from: '#94a3b8', to: '#334155' },
    Vue: { from: '#34d399', to: '#059669' },
    JavaScript: { from: '#fcd34d', to: '#f59e0b' },
    Typescript: { from: '#60a5fa', to: '#4f46e5' },
    HTML5: { from: '#fb923c', to: '#ea580c' },
    CSS: { from: '#60a5fa', to: '#2563eb' },

    // Backend
    NodeJs: { from: '#4ade80', to: '#16a34a' },
    Django: { from: '#16a34a', to: '#065f46' },
    Python: { from: '#60a5fa', to: '#facc15' },
    Java: { from: '#fb923c', to: '#ef4444' },
    'C++': { from: '#60a5fa', to: '#4f46e5' },
    C_Sharp: { from: '#c084fc', to: '#7e22ce' },

    // Databases
    MySQL: { from: '#60a5fa', to: '#0284c7' },
    Postgresql: { from: '#60a5fa', to: '#4338ca' },
    Firebase: { from: '#facc15', to: '#ea580c' },

    // DevOps & Tools
    Docker: { from: '#60a5fa', to: '#0891b2' },
    Kubernetes: { from: '#60a5fa', to: '#4f46e5' },
    'Git-logo': { from: '#fb923c', to: '#dc2626' },
    Jenkins: { from: '#f87171', to: '#b91c1c' },
    VS_Code: { from: '#60a5fa', to: '#4f46e5' },
    AWS: { from: '#fb923c', to: '#c2410c' },
    Microsoft_Azure: { from: '#60a5fa', to: '#4f46e5' },
    Linux: { from: '#facc15', to: '#ea580c' },
    Wordpress: { from: '#60a5fa', to: '#4338ca' },
  };

  return colorMap[skill] || { from: '#3b82f6', to: '#9333ea' };
}

/**
 * Decide if an icon needs a white background
 */
function needsBackground(skill: string): boolean {
  const nonLinearShapes = [
    'React', 'NodeJs', 'Vue', 'Python', 'Docker',
    'Kubernetes', 'Git-logo', 'AWS', 'Firebase',
    'Jenkins', 'Linux', 'HTML5', 'Nextjs', 'Django'
  ];
  return nonLinearShapes.includes(skill);
}

const Skills = () => {
  // State variables
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [visibleSkills, setVisibleSkills] = useState<string[]>([]);
  const [positions, setPositions] = useState<PositionProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedSkills, setHighlightedSkills] = useState<number[]>([]);
  const [showingOverlay, setShowingOverlay] = useState(false);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const MAX_VISIBLE_SKILLS = 12;
  const ICON_SIZE = 64; // px - smaller for more like Mobbin

  // List of companies to display in the overlay
  const companies = [
    { name: 'CGI', logo: '/images/Experience/CGI.svg' },
    { name: 'Fiera Capital', logo: '/images/Experience/FieraCapital.png' },
  ];

  // Fetch skills on mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/skill-icons');
        if (!response.ok) throw new Error('Failed to fetch skills');
        const iconFiles = await response.json();

        const names = iconFiles.map((skill: string) =>
          skill.replace('.svg', '').replace('.png', '')
        );
        setAllSkills(names);

        // Only show up to MAX_VISIBLE_SKILLS
        const initialSkills = names.slice(0, MAX_VISIBLE_SKILLS);
        setVisibleSkills(initialSkills);
      } catch (error) {
        console.error('Error fetching skills:', error);
        // Fallback skill list
        const fallbackSkills = [
          'JavaScript', 'Typescript', 'React', 'Nextjs', 'NodeJs',
          'HTML5', 'CSS', 'Git-logo', 'Java'
        ];
        setAllSkills(fallbackSkills);

        const initialSkills = fallbackSkills.slice(0, MAX_VISIBLE_SKILLS);
        setVisibleSkills(initialSkills);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Set positions for skill icons
  useEffect(() => {
    if (isLoading || visibleSkills.length === 0) return;
    
    // Use preset positions inspired by Mobbin layout
    const newPositions = generateMobbinPositions(visibleSkills.length);
    setPositions(newPositions);
  }, [isLoading, visibleSkills]);

  // Toggle company overlay periodically
  useEffect(() => {
    if (isLoading || visibleSkills.length === 0) return;

    const toggleOverlay = () => {
      setShowingOverlay(true);
      
      // Hide overlay after 3 seconds
      setTimeout(() => {
        setShowingOverlay(false);
        
        // Prepare next company
        setTimeout(() => {
          setCurrentCompanyIndex((prevIndex) => (prevIndex + 1) % companies.length);
        }, 500);
      }, 3000);
    };

    // Show overlay every 8 seconds
    const intervalId = setInterval(toggleOverlay, 8000);
    return () => clearInterval(intervalId);
  }, [isLoading, visibleSkills, companies.length]);

  // Randomly highlight a few icons
  useEffect(() => {
    if (isLoading || visibleSkills.length === 0) return;

    const highlightRandomSkills = () => {
      const maxHighlights = Math.min(3, visibleSkills.length);
      const totalSkills = visibleSkills.length;

      // Generate random indices to highlight
      const newHighlights: number[] = [];
      while (newHighlights.length < maxHighlights) {
        const randomIndex = Math.floor(Math.random() * totalSkills);
        if (!newHighlights.includes(randomIndex)) {
          newHighlights.push(randomIndex);
        }
      }
      setHighlightedSkills(newHighlights);
    };

    // Initial highlight
    highlightRandomSkills();
    
    // Change highlights every 4 seconds
    const intervalId = setInterval(highlightRandomSkills, 4000);
    return () => clearInterval(intervalId);
  }, [isLoading, visibleSkills]);

  // Render a single skill icon
  const renderSkillIcon = (skill: string, index: number) => {
    const position = positions[index];
    if (!position) return null;

    const glowColors = getSkillGlowColors(skill);

    // If user prefers no motion, skip fancy animations
    const floatVariants = prefersReducedMotion
      ? { animate: { scale: 1 } }
      : createFloatAnimation(position.duration, position.delay);

    const pulseVariants = prefersReducedMotion
      ? { animate: { opacity: 0.9 } }
      : createPulseAnimation(position.duration);

    const isHighlighted = highlightedSkills.includes(index);
    const requiresBackground = needsBackground(skill);

    return (
      <motion.div
        key={`${skill}-${index}`}
        className="absolute flex flex-col items-center cursor-pointer group"
        style={{
          left: position.x,
          top: position.y,
          width: ICON_SIZE,
          height: ICON_SIZE,
          transform: `translateX(${position.translateX}px) translateY(${position.translateY}px)`
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isHighlighted ? 1 : 0.9,
          scale: isHighlighted ? 1.1 : 1,
          zIndex: isHighlighted ? 50 : 'auto',
        }}
        transition={{
          duration: 0.4,
          delay: index * 0.02,
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        whileHover={{
          scale: 1.15,
          opacity: 1,
          zIndex: 50,
          transition: { duration: 0.2, type: 'spring', stiffness: 400, damping: 10 },
        }}
        whileTap={{ scale: 1.05 }}
        layoutId={`skill-${skill}`}
      >
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="relative flex items-center justify-center w-full h-full"
        >
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="w-[80%] h-[80%] relative z-10 flex items-center justify-center rounded-[16px] overflow-hidden"
          >
            {/* Background for all icons, not just those that "need" it */}
            <div className="absolute inset-0 rounded-[16px] shadow-lg bg-white z-10" />

            <img
              src={`/images/NewIcons/${
                skill === 'JavaScript' ? `${skill}.png` : `${skill}.svg`
              }`}
              alt={skill}
              className={`
                w-full h-full object-contain transition-all duration-300 relative z-20
                p-2 rounded-[16px]
                filter brightness-110 contrast-110
              `}
            />
          </motion.div>
        </motion.div>

        <div className="mt-2 absolute -bottom-6">
          <motion.span
            className={`
              text-xs font-medium bg-black/80 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap transition-all duration-200 relative
              ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
            style={{
              color: glowColors.from,
              textShadow: `0 0 10px ${glowColors.from}`,
              boxShadow: `0 0 10px 2px ${glowColors.from}40, 0 0 20px 5px ${glowColors.to}20`,
              border: `1px solid ${glowColors.from}40`,
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            {skill.replace('_', ' ').replace('-', ' ')}
          </motion.span>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="relative py-20 overflow-hidden min-h-[90vh] bg-deep-black">
      <div className="container px-4 mx-auto">
        {/* Title - Centered like Mobbin's layout */}
        <div className="flex flex-col items-center mb-20">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Skills</h2>
          <p className="text-xl text-gray-400 text-center max-w-3xl">
            Technologies and languages I work with
          </p>
        </div>

        {isLoading ? (
          <div className="text-center">Loading skills...</div>
        ) : (
          <div ref={containerRef} className="relative w-full h-[600px] grid place-items-center">
            {/* Skill icons floating layer */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Make it pointer-events-auto to enable interactions */}
              <div className="relative w-full h-full pointer-events-auto">
                {visibleSkills.map((skill, index) => renderSkillIcon(skill, index))}
              </div>
            </div>

            {/* Center overlay for company logos */}
            <div className="pointer-events-none z-10">
              {showingOverlay && (
                <div className="flex flex-col items-center justify-center max-w-xl">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.7, 0] }}
                    transition={{ duration: 3, times: [0, 0.2, 1] }}
                    className="text-white text-sm md:text-base font-medium tracking-wider mb-4 opacity-70"
                  >
                    worked with
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3, times: [0, 0.2, 1] }}
                    className="w-full max-w-md flex items-center justify-center"
                  >
                    <img
                      src={companies[currentCompanyIndex].logo}
                      alt={companies[currentCompanyIndex].name}
                      className="max-h-40 md:max-h-52 w-auto object-contain filter brightness-150"
                    />
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
