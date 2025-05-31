'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  getSphereCoordinates, 
  getDepthOpacity, 
  getSkillStyle,
  type SphereCoordinates,
  type SkillStyle 
} from '../utils/3d-utils';
import { shouldExcludeSkill } from '../utils/skill-utils';

// Constants
const PRIMARY_COLOR = '#B8E62D';
const SPHERE_RADIUS = 200;

interface SkillCloudProps {
  availableSkills: string[];
  mousePosition: { x: number; y: number };
  activeSkill: string | null;
  // onSkillClick: (skill: string) => void;
}

const SkillCloud: React.FC<SkillCloudProps> = ({
  availableSkills,
  mousePosition,
  activeSkill,
  // onSkillClick
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
        {availableSkills && availableSkills.length > 0 && availableSkills.map((skill, index) => {
          // Skip rendering excluded skills
          const shouldRenderSkill = !shouldExcludeSkill(skill) && skill !== 'C#';
          if (!shouldRenderSkill) return null;
          
          // Calculate position on a sphere
          const { x, y, z }: SphereCoordinates = getSphereCoordinates(
            index, 
            availableSkills.length, 
            SPHERE_RADIUS
          );
          
          // Get skill styling
          const { fontSize, fontWeight }: SkillStyle = getSkillStyle(skill);
          
          // Calculate opacity based on z position (to create depth)
          const opacity = getDepthOpacity(z, SPHERE_RADIUS);
                  
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
                
                duration: 0.2,
                // delay: index * 0.05,
                type: "spring",
                stiffness: 50,
                damping: 20
              }}
              whileHover={{
                scale: 1.3,
                z: z + 30,
                transition: { duration: 0.3 }
              }}
              // onClick={() => onSkillClick(skill)}
            >
              {skill}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default SkillCloud; 