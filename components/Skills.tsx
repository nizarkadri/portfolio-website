'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, useAnimationControls } from 'framer-motion';

// Animation presets
const createFloatAnimation = (duration: number, delay: number) => ({
  animate: {
    y: [0, -15, 5, -8, 0],
    x: [0, 10, -15, -8, 0],
    filter: [`drop-shadow(0 0 5px rgba(0,0,0,0.2))`, `drop-shadow(0 0 10px rgba(120,120,255,0.3))`, `drop-shadow(0 0 5px rgba(0,0,0,0.2))`],
    transition: {
      y: { 
        duration, 
        repeat: Infinity, 
        repeatType: "loop", 
        ease: [0.4, 0.0, 0.2, 1], // Use cubic-bezier for smoother animation
        delay 
      },
      x: { 
        duration, 
        repeat: Infinity, 
        repeatType: "loop", 
        ease: [0.4, 0.0, 0.2, 1], 
        delay 
      },
      filter: {
        duration: duration * 0.7,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay: delay * 1.5
      }
    }
  }
});

const createPulseAnimation = (duration: number) => ({
  animate: {
    opacity: [0.6, 0.9, 0.6],
    scale: [1, 1.05, 1], // Reduce scale range for subtler effect
    transition: {
      opacity: { 
        duration: duration / 1.5, 
        repeat: Infinity, 
        repeatType: "loop", 
        ease: "easeInOut" 
      },
      scale: { 
        duration: duration / 1.5, 
        repeat: Infinity, 
        repeatType: "loop", 
        ease: "easeInOut" 
      }
    }
  }
});

// Size mapping
const sizeMap = {
  'xs': { width: 40, height: 40 },
  'sm': { width: 80, height: 80 },
  'md': { width: 120, height: 120 },
  'lg': { width: 180, height: 180 }
};

// Map skills to specific glow colors
const getSkillGlowColors = (skill: string): { from: string, to: string } => {
  const colorMap: Record<string, { from: string, to: string }> = {
    // Frontend
    'React': { from: '#38bdf8', to: '#3b82f6' }, // cyan-400 to blue-500
    'Nextjs': { from: '#94a3b8', to: '#334155' }, // slate-400 to slate-700
    'Vue': { from: '#34d399', to: '#059669' }, // emerald-400 to emerald-600
    'JavaScript': { from: '#fcd34d', to: '#f59e0b' }, // yellow-300 to amber-500
    'Typescript': { from: '#60a5fa', to: '#4f46e5' }, // blue-400 to indigo-600
    'HTML5': { from: '#fb923c', to: '#ea580c' }, // orange-400 to orange-600
    'CSS': { from: '#60a5fa', to: '#2563eb' }, // blue-400 to blue-600
    
    // Backend
    'NodeJs': { from: '#4ade80', to: '#16a34a' }, // green-400 to green-600
    'Django': { from: '#16a34a', to: '#065f46' }, // green-600 to emerald-800
    'Python': { from: '#60a5fa', to: '#facc15' }, // blue-400 to yellow-400
    'Java': { from: '#fb923c', to: '#ef4444' }, // orange-400 to red-500
    'C++': { from: '#60a5fa', to: '#4f46e5' }, // blue-400 to indigo-600
    'C_Sharp': { from: '#c084fc', to: '#7e22ce' }, // purple-400 to purple-700
    
    // Databases
    'MySQL': { from: '#60a5fa', to: '#0284c7' }, // blue-400 to sky-600
    'Postgresql': { from: '#60a5fa', to: '#4338ca' }, // blue-400 to indigo-700
    'Firebase': { from: '#facc15', to: '#ea580c' }, // yellow-400 to orange-600
    
    // DevOps & Tools
    'Docker': { from: '#60a5fa', to: '#0891b2' }, // blue-400 to cyan-600
    'Kubernetes': { from: '#60a5fa', to: '#4f46e5' }, // blue-400 to indigo-600
    'Git-logo': { from: '#fb923c', to: '#dc2626' }, // orange-400 to red-600
    'Jenkins': { from: '#f87171', to: '#b91c1c' }, // red-400 to red-700
    'VS_Code': { from: '#60a5fa', to: '#4f46e5' }, // blue-400 to indigo-600
    'AWS': { from: '#fb923c', to: '#c2410c' }, // orange-400 to orange-700
    'Microsoft_Azure': { from: '#60a5fa', to: '#4f46e5' }, // blue-400 to indigo-600
    'Linux': { from: '#facc15', to: '#ea580c' }, // yellow-400 to orange-600
    'Wordpress': { from: '#60a5fa', to: '#4338ca' }, // blue-400 to indigo-700
  };
  
  // Default glow color
  return colorMap[skill] || { from: '#3b82f6', to: '#9333ea' }; // blue-500 to purple-600
};

type SizeType = 'xs' | 'sm' | 'md' | 'lg';
type PositionProps = {
  x: string;
  y: string;
  size: SizeType;
  delay: number;
  duration: number;
};

// Function to generate random positions with good distribution
const generateRandomPositions = (count: number): PositionProps[] => {
  const positions: PositionProps[] = [];
  const sizeOptions: SizeType[] = ['xs', 'sm', 'md', 'lg'];
  const durationRange = { min: 15, max: 25 }; // Longer durations for smoother motions
  const delayRange = { min: 0, max: 5 }; // Wider delay range for less synchronization
  
  // Divide the canvas into a grid to ensure better distribution
  const gridSize = Math.ceil(Math.sqrt(count));
  const cellWidth = 100 / gridSize;
  const cellHeight = 100 / gridSize;
  
  // Create a shuffled array of grid positions
  const gridPositions: [number, number][] = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      gridPositions.push([i, j]);
    }
  }
  
  // Shuffle the grid positions
  for (let i = gridPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gridPositions[i], gridPositions[j]] = [gridPositions[j], gridPositions[i]];
  }
  
  // Use the first 'count' grid positions
  for (let i = 0; i < Math.min(count, gridPositions.length); i++) {
    const [gridX, gridY] = gridPositions[i];
    
    // Add some randomness within each cell
    const xOffset = Math.random() * (cellWidth * 0.7);
    const yOffset = Math.random() * (cellHeight * 0.7);
    
    const x = `${(gridX * cellWidth) + xOffset + (cellWidth * 0.15)}%`;
    const y = `${(gridY * cellHeight) + yOffset + (cellHeight * 0.15)}%`;
    
    // Use only 'md' size for uniform circles
    positions.push({
      x,
      y,
      size: 'md',
      delay: Math.random() * (delayRange.max - delayRange.min) + delayRange.min,
      duration: Math.random() * (durationRange.max - durationRange.min) + durationRange.min
    });
  }
  
  return positions;
};

const Skills = () => {
  const [skillNames, setSkillNames] = useState<string[]>([]);
  const [positions, setPositions] = useState<PositionProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedSkills, setHighlightedSkills] = useState<number[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/skill-icons');
        if (!response.ok) throw new Error('Failed to fetch skills');
        const iconFiles = await response.json();
        const names = iconFiles.map((skill: string) => {
          // Handle both .svg and .png extensions
          return skill.replace('.svg', '').replace('.png', '');
        });
        setSkillNames(names);
        // Generate positions based on number of skills
        setPositions(generateRandomPositions(names.length));
      } catch (error) {
        console.error('Error fetching skills:', error);
        const fallbackSkills = ['javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'html5', 'css3', 'git', 'java'];
        setSkillNames(fallbackSkills);
        setPositions(generateRandomPositions(fallbackSkills.length));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Effect to randomly highlight skills every few seconds
  useEffect(() => {
    if (isLoading || skillNames.length === 0) return;
    
    const highlightRandomSkills = () => {
      const maxHighlights = Math.min(3, skillNames.length);
      const totalSkills = skillNames.length;
      
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
    
    // Set up interval to change highlights
    const intervalId = setInterval(highlightRandomSkills, 4000);
    
    return () => clearInterval(intervalId);
  }, [isLoading, skillNames]);

  // Render a single skill icon with animations
  const renderSkillIcon = (skill: string, index: number) => {
    const position = positions[index];
    if (!position) return null;

    // Use a uniform size for all icons, reduced by 30%
    const size = { width: 84, height: 84 }; // 120 * 0.7 = 84
    
    // Get custom glow colors for this skill
    const glowColors = getSkillGlowColors(skill);
    
    // If reduced motion is preferred, use simpler animations
    const floatVariants = prefersReducedMotion 
      ? { animate: { scale: 1 } } 
      : createFloatAnimation(position.duration, position.delay);
    
    const pulseVariants = prefersReducedMotion
      ? { animate: { opacity: 0.8 } }
      : createPulseAnimation(position.duration);
    
    // Check if this skill is currently highlighted
    const isHighlighted = highlightedSkills.includes(index);
    
    return (
      <motion.div
        key={skill}
        className="absolute flex flex-col items-center cursor-pointer group"
        style={{ 
          left: position.x, 
          top: position.y, 
          width: size.width, 
          height: size.height,
          filter: isHighlighted 
            ? `drop-shadow(0 0 12px ${glowColors.from})` 
            : 'drop-shadow(0 0 5px rgba(0,0,0,0.2))'
        }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isHighlighted ? 1 : 0.8,
          scale: isHighlighted ? 1.35 : 1,
          zIndex: isHighlighted ? 50 : 'auto'
        }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.1,
          scale: { 
            type: "spring", 
            stiffness: 400, 
            damping: 10
          } 
        }}
        whileHover={{ 
          scale: 1.35, 
          opacity: 1, 
          zIndex: 50,
          filter: `drop-shadow(0 0 12px ${glowColors.from})`,
          transition: { duration: 0.2, type: "spring", stiffness: 400, damping: 10 }
        }}
        whileTap={{ 
          scale: 1.2
        }}
        layoutId={`skill-${skill}`}
      >
        <motion.div
          variants={floatVariants}
          animate="animate"
          style={{ 
            width: size.width, 
            height: size.height
          }}
          className="relative rounded-full overflow-hidden"
        >
          <motion.div
            variants={pulseVariants}
            animate="animate"
          />
          
          <div 
            className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden rounded-full"
          >
            {/* Background for better blur visibility */}
            <div className="absolute inset-0 rounded-full bg-black/20 backdrop-blur-sm"></div>
            
            {/* Shadow effect for depth */}
            <div 
              className="absolute inset-0 rounded-full opacity-40" 
              style={{ 
                boxShadow: 'inset 0 5px 15px rgba(255,255,255,0.2), inset 0 -5px 15px rgba(0,0,0,0.3)'
              }}
            ></div>
            
            {/* Glowing border */}
            <motion.div 
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 15px 5px ${glowColors.from}70, 0 0 30px 10px ${glowColors.to}40`,
                border: `1px solid ${glowColors.from}80`,
                filter: 'blur(3px)'
              }}
              animate={{
                opacity: [0.7, 0.9, 0.7],
                boxShadow: [
                  `0 0 15px 5px ${glowColors.from}50, 0 0 30px 10px ${glowColors.to}30`,
                  `0 0 20px 8px ${glowColors.from}70, 0 0 35px 15px ${glowColors.to}40`,
                  `0 0 15px 5px ${glowColors.from}50, 0 0 30px 10px ${glowColors.to}30`
                ]
              }}
              transition={{
                opacity: {
                  duration: position.duration / 3,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                },
                boxShadow: {
                  duration: position.duration / 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                }
              }}
            ></motion.div>
            
            <motion.div 
              className="absolute inset-1 rounded-full blur-lg"
              style={{
                background: `radial-gradient(circle, ${glowColors.from}50 0%, ${glowColors.to}40 70%, transparent 100%)`,
                opacity: 0.9
              }}
              variants={pulseVariants}
              animate="animate"
            ></motion.div>
            
            {/* Shine effect overlay */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent z-20 opacity-0"
              initial={{ x: -100, y: -100, opacity: 0 }}
              animate={{ 
                x: 100, 
                y: 100, 
                opacity: [0, 0.6, 0]
              }}
              transition={{ 
                duration: 3.5, 
                repeat: Infinity, 
                repeatType: "loop", 
                ease: [0.25, 0.1, 0.25, 1],
                delay: position.delay,
                times: [0, 0.5, 1]
              }}
            ></motion.div>
            
            <motion.div
              className="w-[60%] h-[60%] relative z-10"
              whileHover={{
                filter: `drop-shadow(0 0 15px ${glowColors.from}) drop-shadow(0 0 5px ${glowColors.to})`,
                scale: 1.1
              }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src={`/images/NewIcons/${skill}${skill === 'JavaScript' ? '.png' : '.svg'}`}
                alt={skill}
                className="w-full h-full object-contain filter brightness-140 contrast-125 p-2 group-hover:brightness-150 transition-all duration-300"
                style={{
                  filter: `drop-shadow(0 0 8px ${glowColors.from}90)`,
                  transition: 'all 0.3s ease'
                }}
              />
            </motion.div>
          </div>
        </motion.div>
        
        <div className="mt-2 absolute -bottom-6">
          <motion.span
            className={`text-xs font-medium bg-black/80 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap transition-all duration-200 relative ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            style={{ 
              color: glowColors.from,
              textShadow: `0 0 10px ${glowColors.from}`,
              boxShadow: `0 0 10px 2px ${glowColors.from}40, 0 0 20px 5px ${glowColors.to}20`,
              border: `1px solid ${glowColors.from}40`
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            {skill.replace('_', ' ').replace('-', ' ')}
          </motion.span>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="relative py-20 overflow-hidden min-h-[80vh]">
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
          <div className="relative w-full h-[600px]">
            {/* Floating blurred gradient spots */}
            <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#312e81]/10 to-transparent blur-[120px] animate-float-slow"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-[#5b21b6]/10 to-transparent blur-[100px] animate-float"></div>
            
            {skillNames.map((skill, index) => renderSkillIcon(skill, index))}
          </div>
        )}
      </div>
      
      {/* Futuristic grid lines */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[1, 2, 3].map(n => (
          <div key={`h-${n}`} className={`absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent top-${n}/4`}></div>
        ))}
        {[1, 2, 3].map(n => (
          <div key={`v-${n}`} className={`absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent left-${n}/4`}></div>
        ))}
      </div>
      
      {/* Background styling */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[url('/images/tech-background.jpg')] bg-cover bg-center"></div>
      <div className="absolute inset-0 -z-10 backdrop-blur-[8px]"></div>
    </section>
  );
};

export default Skills;
