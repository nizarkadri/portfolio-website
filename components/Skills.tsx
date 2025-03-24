'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence, useInView, useMotionValue, useTransform } from 'framer-motion';

/** Subtle 3D float for each icon - Mobbin-inspired animation */
const createFloatAnimation = (duration: number, delay: number) => ({
  animate: {
    y: [0, -8, 0],
    opacity: [0.95, 1, 0.95],
    transition: {
      y: {
        duration: duration * 0.4,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: [0.33, 1, 0.68, 1], // cubic-bezier curve similar to Mobbin
        delay
      },
      opacity: {
        duration: duration * 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: [0.33, 1, 0.68, 1],
        delay: delay + 0.2
      }
    },
  }
});

/** Subtle "glow" animation (Mobbin style) */
const createPulseAnimation = (duration: number) => ({
  animate: {
    boxShadow: [
      '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      '0 6px 16px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
      '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
    ],
    transform: [
      'translateZ(-2px)',
      'translateZ(-1px)',
      'translateZ(-2px)',
    ],
    transition: {
      boxShadow: {
        duration: duration * 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: [0.33, 1, 0.68, 1] // Mobbin-like easing
      },
      transform: {
        duration: duration * 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: [0.33, 1, 0.68, 1]
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
  const delayRange = { min: 0, max: 2 }; // Shorter delays for more synchronized motion
  const durationRange = { min: 5, max: 8 }; // Shorter durations for Mobbin-like fluidity
  
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
    CSS: { from: '#456EEF', to: '#2563eb' },

    // Backend
    NodeJs: { from: '#4ade80', to: '#16a34a' },
    Django: { from: '#FFFFFF', to: '#E5E5E5' },
    Python: { from: '#60a5fa', to: '#facc15' },
    Java: { from: '#fb923c', to: '#ef4444' },
    'C++': { from: '#60a5fa', to: '#4f46e5' },
    C_Sharp: { from: '#68bc71', to: '#37A041' },
    CSharp: { from: '#68bc71', to: '#37A041' }, // Added alias for C#

    // Databases
    MySQL: { from: '#60a5fa', to: '#0284c7' },
    Postgresql: { from: '#60a5fa', to: '#4338ca' },
    Firebase: { from: '#EEBE32', to: '#F5A623' },

    // DevOps & Tools
    Docker: { from: '#18B9C5', to: '#0891b2' },
    Kubernetes: { from: '#60a5fa', to: '#4f46e5' },
    Git: { from: '#fb923c', to: '#dc2626' },
    Jenkins: { from: '#f87171', to: '#b91c1c' },
    VS_Code: { from: '#60a5fa', to: '#4f46e5' },
    AWS: { from: '#fb923c', to: '#c2410c' },
    GitHub: { from: '#E5E5E5', to: '#CCCCCC' },
    GitLab: { from: '#FC6D26', to: '#E24329' },
    Microsoft_Azure: { from: '#60a5fa', to: '#4f46e5' },
    Linux: { from: '#facc15', to: '#ea580c' },
    Wordpress: { from: '#60a5fa', to: '#4338ca' },
    WordPress: { from: '#60a5fa', to: '#4338ca' },
    Shopify: { from: '#5B8A3C', to: '#479537' },
  };

  return colorMap[skill] || { from: '#FFFFFF', to: '#FFFFFF' };
}

/**
 * Decide if an icon needs a white background
 */
function needsBackground(skill: string): boolean {
  const nonLinearShapes = [
    'React', 'NodeJs', 'Vue', 'Python', 'Docker',
    'Kubernetes', 'Git-logo', 'AWS', 'Firebase',
    'Jenkins', 'Linux', 'HTML5', 'Nextjs', 'Django',
    'JavaScript', 'Typescript'
  ];
  return nonLinearShapes.includes(skill);
}

/**
 * Check if we should use PNG version of a skill icon
 */
function isPngIcon(skill: string): boolean {
  // List of skills that only have PNG files
  const pngIcons = [
    'JavaScript',
    'Docker',
    'GitHub',
    'Azure',
    'WordPress',
    'Shopify',
    'aws',
    'GitLab',
    'Nextjs',
    'Django',
    'Firebase'
  ];
  return pngIcons.includes(skill);
}

/**
 * Get SVG tile effect styles for an icon
 */
function getSvgTileEffectStyles(skill: string): React.CSSProperties {
  const glowColors = getSkillGlowColors(skill);
  
  return {
    background: `#FFFFFF`,
    boxShadow: `0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 1px ${glowColors.from}20`,
    border: `1px solid ${glowColors.from}15`,
    borderRadius: '14px',
    padding: '10px',
    backdropFilter: 'blur(5px)'
  };
}

/**
 * Get PNG specific background styles
 */
function getPngBackgroundStyles(skill: string): React.CSSProperties {
  const glowColors = getSkillGlowColors(skill);
  
  return {
    background: `#FFFFFF`,
    boxShadow: `0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 1px ${glowColors.from}15`,
    border: `1px solid ${glowColors.from}10`,
    borderRadius: '14px',
    padding: '8px',
  };
}

// Constants
const MAX_VISIBLE_SKILLS = 12;
const ICON_SIZE = 80; // Increased from 64 to match the WordPress size
const ROTATION_INTERVAL = 6000; // Rotate skills every 6 seconds

// SkillIcon component to handle hover state properly
const SkillIcon = ({ 
  skill, 
  index, 
  skillId, 
  position, 
  isHighlighted, 
  prefersReducedMotion 
}: {
  skill: string;
  index: number;
  skillId: string;
  position: PositionProps;
  isHighlighted: boolean;
  prefersReducedMotion: boolean | null;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const glowColors = getSkillGlowColors(skill);
  const requiresBackground = needsBackground(skill);
  const isPng = isPngIcon(skill);
  const isWordPress = skill === 'WordPress' || skill === 'Wordpress';
  const isJsOrTs = skill === 'JavaScript' || skill === 'Typescript';

  // If user prefers no motion, skip fancy animations
  const floatVariants = prefersReducedMotion
    ? { animate: { scale: 1 } }
    : createFloatAnimation(position.duration, position.delay);

  const pulseVariants = prefersReducedMotion
    ? { animate: { opacity: 0.9 } }
    : createPulseAnimation(position.duration);
  
  return (
    <motion.div
      key={skillId}
      className="absolute flex flex-col items-center cursor-pointer"
      style={{
        left: position.x,
        top: position.y,
        width: ICON_SIZE,
        height: ICON_SIZE,
        transform: `translateX(${position.translateX}px) translateY(${position.translateY}px)`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isHighlighted ? 1 : 0.95,
        scale: isHighlighted ? 1.03 : 1,
        y: 0,
        zIndex: isHighlighted ? 50 : isWordPress ? 30 : 'auto',
      }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
      transition={{
        duration: 0.6,
        delay: index * 0.05,
        ease: [0.33, 1, 0.68, 1], // Mobbin-like easing
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="relative flex items-center justify-center w-full h-full"
      >
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className="w-[90%] h-[90%] relative z-10 flex items-center justify-center rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            background: isJsOrTs ? 'transparent' : 'white',
          }}
        >
          {/* Clean background for icons - Mobbin style */}
          {!isJsOrTs && (
            <div className="absolute inset-0 rounded-2xl shadow-lg bg-white z-10" 
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                  transform: 'translateZ(-2px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
            />
          )}

          {/* Tile Effect - Different styling for PNG vs SVG */}
          {!isJsOrTs && (
            <div 
              className={`absolute ${isPng ? 'inset-[8%]' : 'inset-[10%]'} z-15 rounded-xl`} 
              style={isPng ? getPngBackgroundStyles(skill) : getSvgTileEffectStyles(skill)}
            />
          )}

          <img
            src={`/images/NewIcons/${skill === 'C_Sharp' ? 'CSharp' : skill}${isPng ? '.png' : '.svg'}`}
            alt={skill === 'C_Sharp' ? 'C#' : skill.replace('_', ' ').replace('-', ' ')}
            className={`
              w-full h-full object-contain transition-all duration-300 relative z-20
              ${isJsOrTs ? '' : 'p-2 rounded-2xl'}
              ${isPng ? 'filter brightness-100 contrast-100' : 'filter brightness-100 contrast-100 saturate-100'}
              scale-110
            `}
            style={{
              imageRendering: 'crisp-edges',
              mixBlendMode: 'normal'
            }}
          />
        </motion.div>
      </motion.div>

      <div className="mt-2 absolute -bottom-6">
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 5,
            scale: isHovered ? 1 : 0.95
          }}
          transition={{
            duration: 0.2,
            ease: [0.33, 1, 0.68, 1]
          }}
          className="text-xs font-medium bg-black/80 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap block text-white"
        >
          {skill === 'C_Sharp' ? 'C#' : skill.replace('_', ' ').replace('-', ' ')}
        </motion.span>
      </div>
    </motion.div>
  );
};

const Skills = () => {
  // State variables
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [visibleSkills, setVisibleSkills] = useState<string[]>([]);
  const [displayedSkillIds, setDisplayedSkillIds] = useState<string[]>([]);
  const [positions, setPositions] = useState<PositionProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedSkills, setHighlightedSkills] = useState<number[]>([]);
  const [showingOverlay, setShowingOverlay] = useState(false);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [collageVisible, setCollageVisible] = useState(true);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });
  
  // Framer Motion values for mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform mouse position to rotation values
  const rotateY = useTransform(mouseX, [-1, 1], [30, -30]);
  const rotateX = useTransform(mouseY, [-1, 1], [-30, 30]);

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

        const names: string[] = iconFiles.map((skill: string) =>
          skill.replace('.svg', '').replace('.png', '')
        );
        
        // Filter out unwanted skills
        const filteredSkills = names.filter(skill => !shouldExcludeSkill(skill));
        setAvailableSkills(filteredSkills);

        // Only show up to MAX_VISIBLE_SKILLS
        const initialSkills: string[] = filteredSkills.slice(0, MAX_VISIBLE_SKILLS);
        setVisibleSkills(initialSkills);
        
        // Create unique IDs for initial skills
        const initialIds: string[] = initialSkills.map((skill: string, index: number) => `${skill}-${index}`);
        setDisplayedSkillIds(initialIds);
      } catch (error) {
        console.error('Error fetching skills:', error);
        // Fallback skill list
        const fallbackSkills: string[] = [
          'JavaScript', 'Typescript', 'React', 'Nextjs', 'NodeJs',
          'Git-logo', 'Java'
        ];
        setAvailableSkills(fallbackSkills);

        const initialSkills: string[] = fallbackSkills.slice(0, MAX_VISIBLE_SKILLS);
        setVisibleSkills(initialSkills);
        
        // Create unique IDs for initial skills
        const initialIds: string[] = initialSkills.map((skill: string, index: number) => `${skill}-${index}`);
        setDisplayedSkillIds(initialIds);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Rotate skills periodically
  useEffect(() => {
    if (isLoading || !availableSkills || availableSkills.length <= MAX_VISIBLE_SKILLS) return;

    const rotateSkills = () => {
      // Keep 2/3 of current skills, replace 1/3 with new ones
      const keepCount = Math.floor(MAX_VISIBLE_SKILLS * 2/3);
      const replaceCount = MAX_VISIBLE_SKILLS - keepCount;

      // Skills to keep (remaining from current visible skills)
      const keepSkills = visibleSkills.slice(0, keepCount);
      
      // Get pool of skills not currently displayed
      const unusedSkills = availableSkills.filter(skill => !visibleSkills.includes(skill));
      
      // If we don't have enough new skills, reuse some from the beginning of availableSkills
      let newSkills: string[] = [];
      if (unusedSkills.length >= replaceCount) {
        // Randomly select from available skills
        newSkills = Array.from({ length: replaceCount }).map(() => {
          const randomIndex = Math.floor(Math.random() * unusedSkills.length);
          const selected = unusedSkills[randomIndex];
          // Remove selected skill to avoid duplicates
          unusedSkills.splice(randomIndex, 1);
          return selected;
        });
      } else {
        // Use all available skills + some from all skills
        newSkills = [
          ...unusedSkills,
          ...availableSkills.slice(0, replaceCount - unusedSkills.length)
        ];
      }

      // Update visible skills list with kept skills + new skills
      const updatedSkills = [...keepSkills, ...newSkills];
      setVisibleSkills(updatedSkills);
      
      // Create unique IDs for each skill for animation purposes
      setDisplayedSkillIds(updatedSkills.map((skill: string, index: number) => `${skill}-${Date.now()}-${index}`));
    };

    const intervalId = setInterval(rotateSkills, ROTATION_INTERVAL);
    return () => clearInterval(intervalId);
  }, [isLoading, availableSkills, visibleSkills]);

  // Set positions for skill icons
  useEffect(() => {
    if (isLoading || visibleSkills.length === 0) return;
    
    // Use preset positions inspired by Mobbin layout
    const newPositions = generateMobbinPositions(MAX_VISIBLE_SKILLS);
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

  // Handle mouse movement for 3D effect using Framer Motion
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!collageRef.current) return;
      
      const { left, top, width, height } = collageRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      // Calculate normalized position (-1 to 1)
      const normalizedX = ((e.clientX - centerX) / (width / 2)) * -1; // Invert for natural feeling
      const normalizedY = (e.clientY - centerY) / (height / 2);
      
      // Smooth the values
      setMousePosition({
        x: normalizedX * 20, // Amplify the effect
        y: normalizedY * 15  // Less effect on the Y axis
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Auto-rotation effect
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setMousePosition(prev => ({
          x: prev.x + 0.05,
          y: prev.y
        }));
      }, 20);
      
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  // Handle clicking on a skill
  const handleSkillClick = (skill: string) => {
    setActiveSkill(skill);
    // You could add additional actions here if needed
  };

  // Render a single skill icon
  const renderSkillIcon = (skill: string, index: number, skillId: string) => {
    if (!positions || positions.length === 0) return null;
    if (shouldExcludeSkill(skill) || skill === 'C#') return null; // Extra check to exclude C#
    const position = positions[index % positions.length];
    if (!position) return null;

    const isHighlighted = highlightedSkills.includes(index);

    return (
      <SkillIcon
        key={skillId}
        skill={skill}
        index={index}
        skillId={skillId}
        position={position}
        isHighlighted={isHighlighted}
        prefersReducedMotion={prefersReducedMotion}
      />
    );
  };

  // Function to determine if a skill should be excluded
  function shouldExcludeSkill(skill: string): boolean {
    const excludedSkills = [
      'HTML5', 'CSS', 'C++', 'Azure', 'C_Sharp', 'CSharp', 
      'WordPress', 'Wordpress', 'Microsoft_Azure', 'C#'
    ];
    return excludedSkills.includes(skill);
  }

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
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Make it pointer-events-auto to enable interactions */}
              <div className="relative w-full h-full pointer-events-auto">
                <AnimatePresence mode="sync">
                  {visibleSkills.map((skill: string, index: number) => renderSkillIcon(skill, index, displayedSkillIds[index] || `skill-${index}-${Date.now()}`))}
                </AnimatePresence>
              </div>
            </div>

            {/* Skill text collage in the middle */}
            <div className="absolute inset-0 z-10">
              <motion.div 
                className="perspective-container skill-sphere"
                ref={collageRef} 
                style={{ 
                  position: 'absolute',
                  height: '100%', 
                  width: '100%',
                  perspective: '1200px',
                  transformStyle: 'preserve-3d'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.5 } }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                {/* Rotating container */}
                <motion.div 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`
                  }}
                >
                  {/* Map all skills to 3D sphere points */}
                  {availableSkills && availableSkills.length > 0 && availableSkills.map((skill, index) => {
                    // Skip rendering excluded skills
                    if (shouldExcludeSkill(skill)) return null;
                    
                    // Calculate position on a sphere
                    const radius = 200; // Radius of the sphere
                    const colors = getSkillGlowColors(skill);
                    
                    // Generate sphere positions
                    const phi = Math.acos(-1 + (2 * index) / availableSkills.length);
                    const theta = Math.sqrt(availableSkills.length * Math.PI) * phi;
                    
                    // Convert to Cartesian coordinates
                    const x = radius * Math.cos(theta) * Math.sin(phi);
                    const y = radius * Math.sin(theta) * Math.sin(phi);
                    const z = radius * Math.cos(phi);
                    
                    // Determine font size and weight based on importance
                    let fontSize = "1rem";
                    let fontWeight = 400;
                    
                    // Prominent skills (bigger)
                    if (["Java", "Python", "React", "NodeJs"].includes(skill)) {
                      fontSize = "2.2rem";
                      fontWeight = 700;
                    } 
                    // Medium-important skills
                    else if (["JavaScript", "TypeScript", "Docker", "Firebase"].includes(skill)) {
                      fontSize = "1.5rem";
                      fontWeight = 600;
                    }
                    
                    // Calculate opacity based on z position (to create depth)
                    const zScaled = (z + radius) / (2 * radius); // Scale to 0-1
                    const opacity = Math.max(0.4, zScaled);
                            
                    return (
                      <motion.div
                        key={skill}
                        className={`skill-word ${activeSkill === skill ? 'active-skill' : ''}`}
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          fontSize,
                          fontWeight,
                          color: '#FFFFFF',
                          transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`,
                          opacity,
                          willChange: 'transform, opacity',
                        }}
                        initial={{
                          opacity: 0,
                          x: (Math.random() - 0.5) * 1000,
                          y: (Math.random() - 0.5) * 1000,
                          z: (Math.random() - 0.5) * 1000,
                          rotateX: Math.random() * 360,
                          rotateY: Math.random() * 360,
                          rotateZ: Math.random() * 360,
                          scale: 0
                        }}
                        animate={{
                          opacity,
                          x: x,
                          y: y,
                          z: z,
                          rotateX: 0,
                          rotateY: 0,
                          rotateZ: 0,
                          scale: 1
                        }}
                        transition={{
                          duration: 2,
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 50,
                          damping: 20
                        }}
                        whileHover={{
                          scale: 1.3,
                          z: z + 30,
                          transition: { duration: 0.3 }
                        }}
                        onClick={() => handleSkillClick(skill)}
                      >
                        {skill}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </div>

            {/* Center overlay for company logos */}
            <div className="pointer-events-none z-30">
              {showingOverlay && (
                <div className="flex flex-col items-center justify-center max-w-xl">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 0.7, 0], y: [10, 0, -5] }}
                    transition={{ 
                      duration: 3, 
                      times: [0, 0.2, 1],
                      ease: [0.33, 1, 0.68, 1]
                    }}
                    className="text-white text-sm md:text-base font-medium tracking-wider mb-4 opacity-70"
                  >
                    worked with
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.95, 1, 0.98] }}
                    transition={{ 
                      duration: 3, 
                      times: [0, 0.2, 1],
                      ease: [0.33, 1, 0.68, 1]
                    }}
                    className="w-full max-w-md flex items-center justify-center"
                  >
                    <img
                      src={companies[currentCompanyIndex].logo}
                      alt={companies[currentCompanyIndex].name}
                      className="max-h-40 md:max-h-52 w-auto object-contain filter brightness-110 contrast-105"
                      style={{
                        filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.25))'
                      }}
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
