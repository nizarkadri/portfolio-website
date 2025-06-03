'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getSphereCoordinates, 
  getDepthOpacity, 
  getSkillStyle,
  type SphereCoordinates,
  type SkillStyle 
} from '../utils/3d-utils';
import { useIsMobile } from '../app/hooks/useMobile';

// Constants
const PRIMARY_COLOR = '#B8E62D';
const SPHERE_RADIUS = 200;

interface SkillCloudProps {
  availableSkills: string[];
  mousePosition: { x: number; y: number };
  activeSkill: string | null;
}

// Mobile Corporate Typography Component
const MobileSkillCloud: React.FC<{ skills: string[] }> = ({ skills }) => {
  const [visibleSkills, setVisibleSkills] = React.useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Show only 50% of skills at once
  const skillsToShow = Math.ceil(skills.length * 0.5);

  // Initialize and rotate skills
  React.useEffect(() => {
    const updateVisibleSkills = () => {
      const startIndex = currentIndex;
      const endIndex = (startIndex + skillsToShow) % skills.length;
      
      let newVisibleSkills;
      if (endIndex > startIndex) {
        newVisibleSkills = skills.slice(startIndex, endIndex);
      } else {
        // Handle wrap around
        newVisibleSkills = [...skills.slice(startIndex), ...skills.slice(0, endIndex)];
      }
      
      setVisibleSkills(newVisibleSkills);
    };

    updateVisibleSkills();

    // Rotate skills every 5 seconds (increased for smoother experience)
    const interval = setInterval(() => {
      // setIsTransitioning(true);
      
      // Small delay before changing skills to allow exit animation
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + Math.ceil(skillsToShow * 0.3)) % skills.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [skills, currentIndex, skillsToShow]);

  // Generate positions for mobile grid layout
  const generateMobilePositions = (skillCount: number) => {
    const positions = [];
    const cols = 3; // Back to 3 columns for better spacing with fewer skills
    const rows = Math.ceil(skillCount / cols);
    
    for (let i = 0; i < skillCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      // Calculate position with better spacing
      const baseX = (col / (cols - 1)) * 80 + 10; // 10% to 90%
      const baseY = (row / (rows - 1)) * 70 + 15; // 15% to 85%
      
      // Add some randomness for organic feel
      const randomX = (Math.random() - 0.5) * 8;
      const randomY = (Math.random() - 0.5) * 8;
      
      positions.push({
        x: Math.max(5, Math.min(95, baseX + randomX)),
        y: Math.max(10, Math.min(90, baseY + randomY))
      });
    }
    
    return positions;
  };

  const positions = generateMobilePositions(visibleSkills.length);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Skills with same styling as desktop */}
          {visibleSkills.map((skill, index) => {
            const position = positions[index];
            const { fontSize, fontWeight } = getSkillStyle(skill);
            
            return (
              <motion.div
                key={skill}
                className="absolute select-none cursor-pointer skill-word active-skill"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  fontSize: `${Math.max(16, parseInt(fontSize) * 1.0)}px`, // Good readable size
                  fontWeight,
                  color: PRIMARY_COLOR,
                  transform: 'translate(-50%, -50%)', // Center the text on the position
                }}
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  y: 30,
                  filter: 'blur(6px)'
                }}
                animate={{
                  opacity: 0.7,
                  scale: 1,
                  y: 0,
                  filter: 'blur(0px)'
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.08,
                  type: "spring",
                  stiffness: 80,
                  damping: 20,
                  opacity: { duration: 0.6, delay: index * 0.08 },
                  scale: { duration: 0.7, delay: index * 0.08 },
                  y: { duration: 0.6, delay: index * 0.08 },
                  filter: { duration: 0.5, delay: index * 0.08 + 0.2 }
                }}
              >
                {skill}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Desktop 3D Sphere Component
const DesktopSkillCloud: React.FC<{ skills: string[]; mousePosition: { x: number; y: number } }> = ({ 
  skills, 
  mousePosition 
}) => {
  return (
    <motion.div 
      className="perspective-container skill-sphere"
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
        {skills.map((skill, index) => {
          // Calculate position on a sphere
          const { x, y, z }: SphereCoordinates = getSphereCoordinates(
            index, 
            skills.length, 
            SPHERE_RADIUS
          );
          
          // Get skill styling
          const { fontSize, fontWeight }: SkillStyle = getSkillStyle(skill);
          
          // Calculate opacity based on z position (to create depth)
          const opacity = getDepthOpacity(z, SPHERE_RADIUS);
                  
          return (
            <motion.div
              key={skill}
              className='skill-word active-skill'
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                fontSize,
                fontWeight,
                color: PRIMARY_COLOR,
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
              whileInView={{
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
                type: "spring",
                stiffness: 50,
                damping: 20
              }}
            >
              {skill}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

// Main SkillCloud Component
const SkillCloud: React.FC<SkillCloudProps> = ({
  availableSkills,
  mousePosition,
  activeSkill,
}) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <MobileSkillCloud skills={availableSkills} />
  ) : (
    <DesktopSkillCloud skills={availableSkills} mousePosition={mousePosition} />
  );
};

export default SkillCloud; 